import { r2Public } from "@/config";
import { auth, errorRes, successRes } from "@/lib/auth";
import {
  carts,
  db,
  orderDraft,
  orderDraftItems,
  orderDraftShippings,
  productImages,
  products,
  productVariants,
} from "@/lib/db";
import { xendit } from "@/lib/utils";
import { createId } from "@paralleldrive/cuid2";
import { and, eq, inArray } from "drizzle-orm";
import { NextRequest } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session) return errorRes("Unauthorized", 401);

    const userId = session.user.id;

    const [draftOrder, storeAddress] = await Promise.all([
      db.query.orderDraft.findFirst({
        columns: { id: true, totalPrice: true, addressId: true },
        where: (o, { eq, and }) =>
          and(eq(o.userId, userId), eq(o.status, "ACTIVE")),
      }),
      db.query.storeAddress.findFirst(),
    ]);

    if (!draftOrder) return errorRes("No draft order found", 400);
    if (!storeAddress) return errorRes("Store address not found", 400);

    const items = await db
      .select({
        id: orderDraftItems.id,
        variantId: orderDraftItems.variantId,
        price: orderDraftItems.price,
        quantity: orderDraftItems.quantity,
        weight: orderDraftItems.weight,
      })
      .from(orderDraftItems)
      .where(eq(orderDraftItems.orderDraftId, draftOrder.id));

    const variantIds = items.map((i) => i.variantId);
    if (variantIds.length === 0) return errorRes("No item in order", 400);

    const variants = await db
      .select()
      .from(productVariants)
      .where(inArray(productVariants.id, variantIds));

    const productIds = [...new Set(variants.map((v) => v.productId))];

    const [productList, images] = await Promise.all([
      db
        .select({ id: products.id, title: products.name })
        .from(products)
        .where(inArray(products.id, productIds)),

      db
        .select({
          id: productImages.id,
          url: productImages.url,
          productId: productImages.productId,
        })
        .from(productImages)
        .where(inArray(productImages.productId, productIds)),
    ]);

    const getImage = (productId: string) =>
      images.find((img) => img.productId === productId)?.url ?? null;

    const getOrderPrice = (variantId: string) =>
      items.find((i) => i.variantId === variantId)?.price ?? "0";
    const getOrderQty = (variantId: string) =>
      items.find((i) => i.variantId === variantId)?.quantity ?? "0";

    const productsFormatted = productList.map((p) => {
      const relatedVariants = variants.filter((v) => v.productId === p.id);
      const defaultVariant = relatedVariants.find((v) => v.isDefault);
      const otherVariants = relatedVariants.filter((v) => !v.isDefault);
      const img = getImage(p.id);

      return {
        id: p.id,
        title: p.title,
        image: img ? `${r2Public}/${img}` : null,
        default_variant: defaultVariant && {
          id: defaultVariant.id,
          name: defaultVariant.name,
          price: getOrderPrice(defaultVariant.id),
          qty: getOrderQty(defaultVariant.id),
        },
        variants: otherVariants.map((v) => ({
          id: v.id,
          name: v.name,
          price: getOrderPrice(v.id),
          qty: getOrderQty(v.id),
        })),
      };
    });

    const totalWeight = items.reduce((acc, item) => {
      return (
        acc + (parseFloat(item.quantity) || 0) * (parseFloat(item.weight) || 0)
      );
    }, 0);

    return successRes(
      {
        total_item: items.length,
        price: Number(draftOrder.totalPrice),
        products: productsFormatted,
        total_weight: totalWeight,
        addressId: draftOrder.addressId,
      },
      "Checkout detail"
    );
  } catch (error) {
    console.error("ERROR_GET_CHECKOUT", error);
    return errorRes("Internal Error", 500);
  }
}

export async function POST() {
  try {
    const isAuth = await auth();
    if (!isAuth) return errorRes("Unauthorized", 401);

    const userId = isAuth.user.id;
    const userRole = isAuth.user.role ?? "BASIC";

    await db
      .update(orderDraft)
      .set({ status: "ABANDONED" })
      .where(
        and(eq(orderDraft.userId, userId), eq(orderDraft.status, "ACTIVE"))
      );

    await db
      .delete(orderDraftShippings)
      .where(eq(orderDraftShippings.userId, userId));

    const addressDefault = await db.query.addresses.findFirst({
      where: (a, { eq, and }) =>
        and(eq(a.userId, userId), eq(a.isDefault, true)),
    });

    const variantSelected = await db
      .select({
        variantId: carts.variantId,
        qty: carts.quantity,
        basicPrice: productVariants.basicPrice,
        petShopPrice: productVariants.petShopPrice,
        doctorPrice: productVariants.doctorPrice,
        weight: productVariants.weight,
      })
      .from(carts)
      .leftJoin(productVariants, eq(carts.variantId, productVariants.id))
      .where(and(eq(carts.userId, userId), eq(carts.checked, true)));

    const formatPrice = (item: {
      variantId: string;
      qty: string;
      basicPrice: string | null;
      petShopPrice: string | null;
      doctorPrice: string | null;
      weight: string | null;
    }) => {
      if (userRole === "PETSHOP") return Number(item.petShopPrice);
      if (userRole === "VETERINARIAN") return Number(item.doctorPrice);
      return Number(item.basicPrice);
    };

    const totalWeight = variantSelected.reduce(
      (arr, curr) => arr + Number(curr.weight ?? "0"),
      0
    );

    const totalPrice = variantSelected.reduce(
      (acc, curr) => acc + formatPrice(curr) * Number(curr.qty),
      0
    );

    const orderDraftId = createId();

    await db.insert(orderDraft).values({
      id: orderDraftId,
      userId,
      totalPrice: totalPrice.toString(),
      addressId: addressDefault?.id,
      totalWeight: totalWeight.toString(),
    });

    await db.insert(orderDraftItems).values(
      variantSelected.map((item) => ({
        orderDraftId,
        variantId: item.variantId,
        price: formatPrice(item).toString(),
        quantity: item.qty,
        weight: item.weight ?? "0",
      }))
    );

    return successRes(null, "Checkout created");
  } catch (error) {
    console.log("ERROR_CREATE_CHECKOUT", error);
    return errorRes("Internal Error", 500);
  }
}

export async function PUT() {
  try {
    const { Invoice } = xendit;

    const a = await Invoice.createInvoice({
      data: {
        amount: 15000,
        currency: "IDR",
        externalId: createId(),
        successRedirectUrl:
          "https://974a22b2ed29.ngrok-free.app/api/checkout/success",
        failureRedirectUrl:
          "https://974a22b2ed29.ngrok-free.app/api/checkout/failed",
      },
    });

    return successRes(a, "Success");
  } catch (error) {
    console.log(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const data = {
      success: true,
      object: "courier_pricing",
      message: "Success to retrieve courier pricing",
      code: 20001007,
      origin: {
        location_id: null,
        latitude: "-6.291974",
        longitude: " 106.801207",
        postal_code: 12430,
        country_name: "Indonesia",
        country_code: "ID",
        administrative_division_level_1_name: "DKI Jakarta",
        administrative_division_level_1_type: "province",
        administrative_division_level_2_name: "Jakarta Selatan",
        administrative_division_level_2_type: "city",
        administrative_division_level_3_name: "Cilandak",
        administrative_division_level_3_type: "district",
        administrative_division_level_4_name: "Cilandak Barat",
        administrative_division_level_4_type: "subdistrict",
        address: null,
      },
      stops: [],
      destination: {
        location_id: null,
        latitude: "-6.288941",
        longitude: " 106.806473",
        postal_code: 12430,
        country_name: "Indonesia",
        country_code: "ID",
        administrative_division_level_1_name: "DKI Jakarta",
        administrative_division_level_1_type: "province",
        administrative_division_level_2_name: "Jakarta Selatan",
        administrative_division_level_2_type: "city",
        administrative_division_level_3_name: "Cilandak",
        administrative_division_level_3_type: "district",
        administrative_division_level_4_name: "Cilandak Barat",
        administrative_division_level_4_type: "subdistrict",
        address: null,
      },
      pricing: [
        {
          available_collection_method: ["pickup"],
          available_for_cash_on_delivery: false,
          available_for_proof_of_delivery: false,
          available_for_instant_waybill_id: true,
          available_for_insurance: true,
          company: "paxel",
          courier_name: "Paxel",
          courier_code: "paxel",
          courier_service_name: "Small Package",
          courier_service_code: "small",
          currency: "IDR",
          description: "Small (20 x 11 x 7 cm) Package Shipment",
          duration: "8 - 12 hours",
          shipment_duration_range: "8 - 12",
          shipment_duration_unit: "hours",
          service_type: "standard",
          shipping_type: "parcel",
          price: 15500,
          tax_lines: [],
          type: "small",
        },
        {
          available_collection_method: ["pickup"],
          available_for_cash_on_delivery: false,
          available_for_proof_of_delivery: false,
          available_for_instant_waybill_id: true,
          available_for_insurance: true,
          company: "paxel",
          courier_name: "Paxel",
          courier_code: "paxel",
          courier_service_name: "Medium Package",
          courier_service_code: "medium",
          currency: "IDR",
          description: "Medium (30 x 20 x 12 cm) Package Shipment",
          duration: "8 - 12 hours",
          shipment_duration_range: "8 - 12",
          shipment_duration_unit: "hours",
          service_type: "standard",
          shipping_type: "parcel",
          price: 17500,
          tax_lines: [],
          type: "medium",
        },
        {
          available_collection_method: ["pickup"],
          available_for_cash_on_delivery: false,
          available_for_proof_of_delivery: false,
          available_for_instant_waybill_id: true,
          available_for_insurance: true,
          company: "paxel",
          courier_name: "Paxel",
          courier_code: "paxel",
          courier_service_name: "Large Package",
          courier_service_code: "large",
          currency: "IDR",
          description: "Large (35 x 30 x 20 cm) Package Shipment",
          duration: "8 - 12 hours",
          shipment_duration_range: "8 - 12",
          shipment_duration_unit: "hours",
          service_type: "standard",
          shipping_type: "parcel",
          price: 20500,
          tax_lines: [],
          type: "large",
        },
        {
          available_collection_method: ["pickup"],
          available_for_cash_on_delivery: true,
          available_for_proof_of_delivery: false,
          available_for_instant_waybill_id: true,
          available_for_insurance: true,
          company: "jne",
          courier_name: "JNE",
          courier_code: "jne",
          courier_service_name: "Reguler",
          courier_service_code: "reg",
          currency: "IDR",
          description: "Layanan reguler",
          duration: "1 - 2 days",
          shipment_duration_range: "1 - 2",
          shipment_duration_unit: "days",
          service_type: "standard",
          shipping_type: "parcel",
          price: 10000,
          tax_lines: [],
          type: "reg",
        },
        {
          available_collection_method: ["pickup"],
          available_for_cash_on_delivery: false,
          available_for_proof_of_delivery: false,
          available_for_instant_waybill_id: true,
          available_for_insurance: true,
          company: "jne",
          courier_name: "JNE",
          courier_code: "jne",
          courier_service_name: "JNE Trucking",
          courier_service_code: "jtr",
          currency: "IDR",
          description: "Trucking with minimum weight of 10 kg",
          duration: "3 - 4 days",
          shipment_duration_range: "3 - 4",
          shipment_duration_unit: "days",
          service_type: "standard",
          shipping_type: "freight",
          price: 40000,
          tax_lines: [],
          type: "jtr",
        },
        {
          available_collection_method: ["pickup"],
          available_for_cash_on_delivery: false,
          available_for_proof_of_delivery: false,
          available_for_instant_waybill_id: true,
          available_for_insurance: true,
          company: "jne",
          courier_name: "JNE",
          courier_code: "jne",
          courier_service_name: "Yakin Esok Sampai (YES)",
          courier_service_code: "yes",
          currency: "IDR",
          description: "Yakin esok sampai",
          duration: "1 - 1 days",
          shipment_duration_range: "1 - 1",
          shipment_duration_unit: "days",
          service_type: "overnight",
          shipping_type: "parcel",
          price: 18000,
          tax_lines: [],
          type: "yes",
        },
        {
          available_collection_method: ["pickup"],
          available_for_cash_on_delivery: true,
          available_for_proof_of_delivery: false,
          available_for_instant_waybill_id: true,
          available_for_insurance: true,
          company: "idexpress",
          courier_name: "IDexpress",
          courier_code: "idexpress",
          courier_service_name: "Reguler",
          courier_service_code: "reg",
          currency: "IDR",
          description: "Layanan reguler",
          duration: "2 - 3 days",
          shipment_duration_range: "2 - 3",
          shipment_duration_unit: "days",
          service_type: "standard",
          shipping_type: "parcel",
          price: 9000,
          tax_lines: [],
          type: "reg",
        },
        {
          available_collection_method: ["pickup"],
          available_for_cash_on_delivery: true,
          available_for_proof_of_delivery: true,
          available_for_instant_waybill_id: true,
          available_for_insurance: true,
          company: "deliveree",
          courier_name: "Deliveree",
          courier_code: "deliveree",
          courier_service_name: "Economy",
          courier_service_code: "economy",
          currency: "IDR",
          description: "Economy",
          duration: "1 - 3 hours",
          shipment_duration_range: "1 - 3",
          shipment_duration_unit: "hours",
          service_type: "same_day",
          shipping_type: "parcel",
          price: 38640,
          tax_lines: [],
          type: "economy",
        },
        {
          available_collection_method: ["pickup"],
          available_for_cash_on_delivery: true,
          available_for_proof_of_delivery: true,
          available_for_instant_waybill_id: true,
          available_for_insurance: true,
          company: "deliveree",
          courier_name: "Deliveree",
          courier_code: "deliveree",
          courier_service_name: "Van",
          courier_service_code: "van",
          currency: "IDR",
          description: "Van",
          duration: "2 - 4 hours",
          shipment_duration_range: "2 - 4",
          shipment_duration_unit: "hours",
          service_type: "same_day",
          shipping_type: "parcel",
          price: 102360,
          tax_lines: [],
          type: "van",
        },
        {
          available_collection_method: ["pickup"],
          available_for_cash_on_delivery: true,
          available_for_proof_of_delivery: true,
          available_for_instant_waybill_id: true,
          available_for_insurance: true,
          company: "deliveree",
          courier_name: "Deliveree",
          courier_code: "deliveree",
          courier_service_name: "Small Box Truck",
          courier_service_code: "small_box",
          currency: "IDR",
          description: "Small Box",
          duration: "2 - 4 hours",
          shipment_duration_range: "2 - 4",
          shipment_duration_unit: "hours",
          service_type: "same_day",
          shipping_type: "freight",
          price: 168240,
          tax_lines: [],
          type: "small_box",
        },
        {
          available_collection_method: ["pickup"],
          available_for_cash_on_delivery: true,
          available_for_proof_of_delivery: true,
          available_for_instant_waybill_id: true,
          available_for_insurance: true,
          company: "deliveree",
          courier_name: "Deliveree",
          courier_code: "deliveree",
          courier_service_name: "Engkel Box",
          courier_service_code: "engkel_box",
          currency: "IDR",
          description: "Engkel Box",
          duration: "4 - 8 hours",
          shipment_duration_range: "4 - 8",
          shipment_duration_unit: "hours",
          service_type: "same_day",
          shipping_type: "freight",
          price: 337800,
          tax_lines: [],
          type: "engkel_box",
        },
        {
          available_collection_method: ["pickup"],
          available_for_cash_on_delivery: true,
          available_for_proof_of_delivery: true,
          available_for_instant_waybill_id: true,
          available_for_insurance: true,
          company: "deliveree",
          courier_name: "Deliveree",
          courier_code: "deliveree",
          courier_service_name: "Engkel Pickup",
          courier_service_code: "engkel_pickup",
          currency: "IDR",
          description: "Engkel Pickup",
          duration: "4 - 8 hours",
          shipment_duration_range: "4 - 8",
          shipment_duration_unit: "hours",
          service_type: "same_day",
          shipping_type: "freight",
          price: 343000,
          tax_lines: [],
          type: "engkel_pickup",
        },
        {
          available_collection_method: ["pickup"],
          available_for_cash_on_delivery: true,
          available_for_proof_of_delivery: true,
          available_for_instant_waybill_id: true,
          available_for_insurance: true,
          company: "deliveree",
          courier_name: "Deliveree",
          courier_code: "deliveree",
          courier_service_name: "Double Engkel Box",
          courier_service_code: "cdd_box",
          currency: "IDR",
          description: "CDD Box",
          duration: "4 - 8 hours",
          shipment_duration_range: "4 - 8",
          shipment_duration_unit: "hours",
          service_type: "same_day",
          shipping_type: "freight",
          price: 509000,
          tax_lines: [],
          type: "cdd_box",
        },
        {
          available_collection_method: ["pickup"],
          available_for_cash_on_delivery: true,
          available_for_proof_of_delivery: true,
          available_for_instant_waybill_id: true,
          available_for_insurance: true,
          company: "deliveree",
          courier_name: "Deliveree",
          courier_code: "deliveree",
          courier_service_name: "Double Engkel Pickup",
          courier_service_code: "cdd_pickup",
          currency: "IDR",
          description: "CDD Pickup",
          duration: "4 - 8 hours",
          shipment_duration_range: "4 - 8",
          shipment_duration_unit: "hours",
          service_type: "same_day",
          shipping_type: "freight",
          price: 522000,
          tax_lines: [],
          type: "cdd_pickup",
        },
        {
          available_collection_method: ["pickup"],
          available_for_cash_on_delivery: true,
          available_for_proof_of_delivery: true,
          available_for_instant_waybill_id: true,
          available_for_insurance: true,
          company: "deliveree",
          courier_name: "Deliveree",
          courier_code: "deliveree",
          courier_service_name: "Fuso Lite",
          courier_service_code: "fuso_light",
          currency: "IDR",
          description: "Fuso Light",
          duration: "1 days",
          shipment_duration_range: "1",
          shipment_duration_unit: "days",
          service_type: "same_day",
          shipping_type: "freight",
          price: 863050,
          tax_lines: [],
          type: "fuso_light",
        },
        {
          available_collection_method: ["pickup"],
          available_for_cash_on_delivery: true,
          available_for_proof_of_delivery: true,
          available_for_instant_waybill_id: true,
          available_for_insurance: true,
          company: "deliveree",
          courier_name: "Deliveree",
          courier_code: "deliveree",
          courier_service_name: "Fuso Heavy",
          courier_service_code: "fuso_heavy",
          currency: "IDR",
          description: "Fuso Heavy",
          duration: "1 days",
          shipment_duration_range: "1",
          shipment_duration_unit: "days",
          service_type: "same_day",
          shipping_type: "freight",
          price: 1062250,
          tax_lines: [],
          type: "fuso_heavy",
        },
        {
          available_collection_method: ["pickup"],
          available_for_cash_on_delivery: true,
          available_for_proof_of_delivery: true,
          available_for_instant_waybill_id: true,
          available_for_insurance: true,
          company: "deliveree",
          courier_name: "Deliveree",
          courier_code: "deliveree",
          courier_service_name: "Tronton Wing Box",
          courier_service_code: "tronton_wing_box",
          currency: "IDR",
          description: "Tronton WingBox",
          duration: "1 days",
          shipment_duration_range: "1",
          shipment_duration_unit: "days",
          service_type: "same_day",
          shipping_type: "freight",
          price: 1703000,
          tax_lines: [],
          type: "tronton_wing_box",
        },
        {
          available_collection_method: ["pickup"],
          available_for_cash_on_delivery: true,
          available_for_proof_of_delivery: true,
          available_for_instant_waybill_id: true,
          available_for_insurance: true,
          company: "deliveree",
          courier_name: "Deliveree",
          courier_code: "deliveree",
          courier_service_name: "Tronton Box",
          courier_service_code: "tronton_box",
          currency: "IDR",
          description: "Tronton Box",
          duration: "1 days",
          shipment_duration_range: "1",
          shipment_duration_unit: "days",
          service_type: "same_day",
          shipping_type: "freight",
          price: 1803000,
          tax_lines: [],
          type: "tronton_box",
        },
        {
          available_collection_method: ["pickup"],
          available_for_cash_on_delivery: true,
          available_for_proof_of_delivery: false,
          available_for_instant_waybill_id: true,
          available_for_insurance: true,
          company: "sicepat",
          courier_name: "SiCepat",
          courier_code: "sicepat",
          courier_service_name: "Besok Sampai Tujuan",
          courier_service_code: "best",
          currency: "IDR",
          description: "Besok sampai tujuan",
          duration: "1 days",
          shipment_duration_range: "1",
          shipment_duration_unit: "days",
          service_type: "overnight",
          shipping_type: "parcel",
          price: 14000,
          tax_lines: [],
          type: "best",
        },
        {
          available_collection_method: ["pickup"],
          available_for_cash_on_delivery: true,
          available_for_proof_of_delivery: false,
          available_for_instant_waybill_id: true,
          available_for_insurance: true,
          company: "sicepat",
          courier_name: "SiCepat",
          courier_code: "sicepat",
          courier_service_name: "Reguler",
          courier_service_code: "reg",
          currency: "IDR",
          description: "Layanan reguler",
          duration: "1 - 2 days",
          shipment_duration_range: "1 - 2",
          shipment_duration_unit: "days",
          service_type: "standard",
          shipping_type: "parcel",
          price: 11500,
          tax_lines: [],
          type: "reg",
        },
        {
          available_collection_method: ["pickup"],
          available_for_cash_on_delivery: false,
          available_for_proof_of_delivery: false,
          available_for_instant_waybill_id: false,
          available_for_insurance: true,
          company: "lalamove",
          courier_name: "Lalamove",
          courier_code: "lalamove",
          courier_service_name: "Motorcycle",
          courier_service_code: "motorcycle",
          currency: "IDR",
          description: "Delivery using bike",
          duration: "1 - 3 Hours",
          shipment_duration_range: "1 - 3",
          shipment_duration_unit: "hours",
          service_type: "same_day",
          shipping_type: "parcel",
          price: 12500,
          tax_lines: [],
          type: "motorcycle",
        },
        {
          available_collection_method: ["pickup"],
          available_for_cash_on_delivery: false,
          available_for_proof_of_delivery: false,
          available_for_instant_waybill_id: true,
          available_for_insurance: true,
          company: "jnt",
          courier_name: "J&T",
          courier_code: "jnt",
          courier_service_name: "EZ",
          courier_service_code: "ez",
          currency: "IDR",
          description: "Layanan reguler",
          duration: "2 - 3 days",
          shipment_duration_range: "2 - 3",
          shipment_duration_unit: "days",
          service_type: "standard",
          shipping_type: "parcel",
          price: 8000,
          tax_lines: [],
          type: "ez",
        },
        {
          available_collection_method: ["pickup"],
          available_for_cash_on_delivery: true,
          available_for_proof_of_delivery: false,
          available_for_instant_waybill_id: true,
          available_for_insurance: true,
          company: "sap",
          courier_name: "SAP",
          courier_code: "sap",
          courier_service_name: "Regular Service",
          courier_service_code: "reg",
          currency: "IDR",
          description: "Regular Service",
          duration: "1 - 3 days",
          shipment_duration_range: "1 - 3",
          shipment_duration_unit: "days",
          service_type: "standard",
          shipping_type: "parcel",
          price: 8000,
          tax_lines: [],
          type: "reg",
        },
        {
          available_collection_method: ["pickup"],
          available_for_cash_on_delivery: true,
          available_for_proof_of_delivery: false,
          available_for_instant_waybill_id: true,
          available_for_insurance: true,
          company: "sap",
          courier_name: "SAP",
          courier_code: "sap",
          courier_service_name: "One Day Service",
          courier_service_code: "ods",
          currency: "IDR",
          description: "One Day Service",
          duration: "1 - 2 days",
          shipment_duration_range: "1 - 2",
          shipment_duration_unit: "days",
          service_type: "overnight",
          shipping_type: "parcel",
          price: 15000,
          tax_lines: [],
          type: "ods",
        },
        {
          available_collection_method: ["pickup"],
          available_for_cash_on_delivery: true,
          available_for_proof_of_delivery: false,
          available_for_instant_waybill_id: true,
          available_for_insurance: true,
          company: "sap",
          courier_name: "SAP",
          courier_code: "sap",
          courier_service_name: "Same Day Service",
          courier_service_code: "sds",
          currency: "IDR",
          description: "Same Day Service",
          duration: "0 - 1 days",
          shipment_duration_range: "0 - 1",
          shipment_duration_unit: "days",
          service_type: "same_day",
          shipping_type: "parcel",
          price: 34000,
          tax_lines: [],
          type: "sds",
        },
        {
          available_collection_method: ["pickup"],
          available_for_cash_on_delivery: false,
          available_for_proof_of_delivery: false,
          available_for_instant_waybill_id: true,
          available_for_insurance: true,
          company: "rpx",
          courier_name: "RPX",
          courier_code: "rpx",
          courier_service_name: "SameDay Package",
          courier_service_code: "sdp",
          currency: "IDR",
          description: "Same Day Package (SDP)",
          duration: "12 hours",
          shipment_duration_range: "12",
          shipment_duration_unit: "hours",
          service_type: "same_day",
          shipping_type: "parcel",
          price: 57500,
          tax_lines: [],
          type: "sdp",
        },
        {
          available_collection_method: ["pickup"],
          available_for_cash_on_delivery: false,
          available_for_proof_of_delivery: false,
          available_for_instant_waybill_id: true,
          available_for_insurance: true,
          company: "rpx",
          courier_name: "RPX",
          courier_code: "rpx",
          courier_service_name: "Heavy Weight Delivery",
          courier_service_code: "hwp",
          currency: "IDR",
          description: "Heavy Weight Delivery (HWP)",
          duration: "3 days",
          shipment_duration_range: "3",
          shipment_duration_unit: "days",
          service_type: "cargo",
          shipping_type: "cargo",
          price: 80000,
          tax_lines: [],
          type: "hwp",
        },
        {
          available_collection_method: ["pickup"],
          available_for_cash_on_delivery: false,
          available_for_proof_of_delivery: false,
          available_for_instant_waybill_id: true,
          available_for_insurance: true,
          company: "rpx",
          courier_name: "RPX",
          courier_code: "rpx",
          courier_service_name: "Economy Delivery",
          courier_service_code: "ecp",
          currency: "IDR",
          description: "Economy Delivery (ECP)",
          duration: "2 days",
          shipment_duration_range: "2",
          shipment_duration_unit: "days",
          service_type: "standard",
          shipping_type: "parcel",
          price: 68000,
          tax_lines: [],
          type: "ecp",
        },
        {
          available_collection_method: ["pickup"],
          available_for_cash_on_delivery: false,
          available_for_proof_of_delivery: false,
          available_for_instant_waybill_id: true,
          available_for_insurance: true,
          company: "rpx",
          courier_name: "RPX",
          courier_code: "rpx",
          courier_service_name: "Next Day Package",
          courier_service_code: "ndp",
          currency: "IDR",
          description: "Next Day Package (NDP)",
          duration: "1 day",
          shipment_duration_range: "1",
          shipment_duration_unit: "day",
          service_type: "overnight",
          shipping_type: "parcel",
          price: 16500,
          tax_lines: [],
          type: "ndp",
        },
        {
          available_collection_method: ["pickup"],
          available_for_cash_on_delivery: false,
          available_for_proof_of_delivery: false,
          available_for_instant_waybill_id: true,
          available_for_insurance: true,
          company: "rpx",
          courier_name: "RPX",
          courier_code: "rpx",
          courier_service_name: "MidDay Package",
          courier_service_code: "mdp",
          currency: "IDR",
          description: "Mid Day Package (MDP)",
          duration: "1 day",
          shipment_duration_range: "1",
          shipment_duration_unit: "day",
          service_type: "overnight",
          shipping_type: "parcel",
          price: 30000,
          tax_lines: [],
          type: "mdp",
        },
        {
          available_collection_method: ["pickup"],
          available_for_cash_on_delivery: false,
          available_for_proof_of_delivery: false,
          available_for_instant_waybill_id: true,
          available_for_insurance: true,
          company: "rpx",
          courier_name: "RPX",
          courier_code: "rpx",
          courier_service_name: "Regular Package",
          courier_service_code: "rgp",
          currency: "IDR",
          description: "Regular Package (RGP)",
          duration: "2 days",
          shipment_duration_range: "2",
          shipment_duration_unit: "days",
          service_type: "standard",
          shipping_type: "parcel",
          price: 10000,
          tax_lines: [],
          type: "rgp",
        },
        {
          available_collection_method: ["pickup", "drop_off"],
          available_for_cash_on_delivery: false,
          available_for_proof_of_delivery: false,
          available_for_instant_waybill_id: true,
          available_for_insurance: true,
          company: "pos",
          courier_name: "Pos Indonesia",
          courier_code: "pos",
          courier_service_name: "Pos Reguler",
          courier_service_code: "reg",
          currency: "IDR",
          description: "Layanan Reguler",
          duration: "2 days",
          shipment_duration_range: "2",
          shipment_duration_unit: "days",
          service_type: "standard",
          shipping_type: "parcel",
          price: 8000,
          tax_lines: [],
          type: "reg",
        },
      ],
    };

    type Courier = {
      name: string;
      duration: string;
      price: number;
    };

    type PricingItem = {
      courier_name: string;
      duration: string; // e.g. "1 - 3 hours", "0 - 1 days"
      price: number;
    };

    /**
     * Converts a duration string like "1 - 3 days" or "1 - 3 hours"
     * to average hours (e.g. 2 days => 48 hours, 2 hours => 2 hours).
     */
    function getAverageDurationInHours(duration: string): number {
      const matches = duration.match(/\d+/g);
      const unit = duration.toLowerCase().includes("hour") ? "hour" : "day";

      if (!matches || matches.length === 0) return 9999;

      const min = parseInt(matches[0]);
      const max = parseInt(matches[1] || matches[0]);
      const avg = (min + max) / 2;

      return unit === "day" ? avg * 24 : avg;
    }

    function getFastestAndCheapest(pricing: PricingItem[]): {
      fastest: Courier;
      cheapest: Courier;
    } {
      const fastest = pricing.reduce((a, b) =>
        getAverageDurationInHours(a.duration) <=
        getAverageDurationInHours(b.duration)
          ? a
          : b
      );

      const cheapest = pricing.reduce((a, b) => (a.price <= b.price ? a : b));

      return {
        fastest: {
          name: fastest.courier_name,
          duration: fastest.duration,
          price: fastest.price,
        },
        cheapest: {
          name: cheapest.courier_name,
          duration: cheapest.duration,
          price: cheapest.price,
        },
      };
    }

    const a = getFastestAndCheapest(data.pricing);

    return successRes(a, "success");
  } catch (error) {
    console.log(error);
  }
}
