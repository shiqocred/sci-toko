import { r2Public } from "@/config";
import { auth, errorRes, successRes } from "@/lib/auth";
import {
  carts,
  db,
  invoices,
  orderDraft,
  orderDraftItems,
  orderDraftShippings,
  orderItems,
  orders,
  productImages,
  products,
  productVariants,
  shippings,
} from "@/lib/db";
import { xendit } from "@/lib/utils";
import { createId } from "@paralleldrive/cuid2";
import { and, eq, inArray, sql } from "drizzle-orm";
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
      db.query.storeDetail.findFirst(),
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
      (arr, curr) => arr + Number(curr.weight ?? "0") * Number(curr.qty ?? "0"),
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

export async function PUT(req: NextRequest) {
  try {
    const { Invoice } = xendit;
    const userId = req.nextUrl.searchParams.get("userId") ?? "";

    // 🔹 Cek order draft aktif
    const orderDrafExist = await db.query.orderDraft.findFirst({
      where: (od, { eq, and }) =>
        and(eq(od.userId, userId), eq(od.status, "ACTIVE")),
    });
    if (!orderDrafExist)
      return errorRes("Failed to checkout, Order draft not found.", 400);

    const addressId = orderDrafExist.addressId;
    if (!addressId)
      return errorRes("Failed to checkout, no address selected", 400);

    const storeDetail = await db.query.storeDetail.findFirst();
    if (!storeDetail)
      return errorRes("Store detail not found, please contact sales", 400);

    const addressSelected = await db.query.addresses.findFirst({
      where: (a, { eq, and }) => and(eq(a.id, addressId), eq(a.userId, userId)),
    });
    if (!addressSelected)
      return errorRes("Failed to checkout, no selected address found", 400);

    const orderDraftShippingsExist =
      await db.query.orderDraftShippings.findFirst({
        where: (ods, { eq, and }) =>
          and(eq(ods.orderDraftId, orderDrafExist.id), eq(ods.userId, userId)),
      });
    if (!orderDraftShippingsExist)
      return errorRes("Failed to checkout, no selected shipping found", 400);

    const orderDraftItemsExist = await db.query.orderDraftItems.findMany({
      where: (odi, { eq }) => eq(odi.orderDraftId, orderDrafExist.id),
    });
    if (!orderDraftItemsExist.length)
      return errorRes("Failed to checkout, no items in draft", 400);

    // ==========================
    // 1️⃣ CEK STOK SEBELUM TRANSAKSI
    // ==========================
    const variantIds = orderDraftItemsExist.map((item) => item.variantId);
    const variantsStock = await db.query.productVariants.findMany({
      where: (pv, { inArray }) => inArray(pv.id, variantIds),
      columns: { id: true, stock: true },
    });

    const insufficientStock = orderDraftItemsExist.filter((item) => {
      const variant = variantsStock.find((v) => v.id === item.variantId);
      return Number(item.quantity) > Number(variant?.stock ?? 0);
    });

    if (insufficientStock.length > 0) {
      return errorRes(`Some products have insufficient stock`, 400);
    }

    // ==========================
    // 2️⃣ BUAT INVOICE
    // ==========================
    const orderId = createId();
    const totalPrice =
      Number(orderDrafExist.totalPrice) +
      Number(orderDraftShippingsExist.price);

    const invoice = await Invoice.createInvoice({
      data: {
        amount: totalPrice,
        currency: "IDR",
        externalId: orderId,
        successRedirectUrl:
          "https://2c43c5d5e15b.ngrok-free.app/api/checkout/success",
        failureRedirectUrl:
          "https://2c43c5d5e15b.ngrok-free.app/api/checkout/failed",
        invoiceDuration: 10800,
      },
    });

    // ==========================
    // 3️⃣ TRANSAKSI + LOCK STOK
    // ==========================
    await db.transaction(async (tx) => {
      // Lock semua varian sebelum update stok
      await Promise.all(
        variantIds.map((id) =>
          tx.execute(
            sql`SELECT * FROM product_variants WHERE id = ${id} FOR UPDATE`
          )
        )
      );

      // Insert order utama
      await tx.insert(orders).values({
        id: orderId,
        userId,
        productPrice: orderDrafExist.totalPrice,
        shippingPrice: orderDraftShippingsExist.price,
        totalPrice: totalPrice.toString(),
      });

      // Insert item pesanan
      await tx.insert(orderItems).values(
        orderDraftItemsExist.map((item) => ({
          orderId,
          variantId: item.variantId,
          price: item.price,
          weight: item.weight,
          quantity: item.quantity,
        }))
      );

      // Insert invoice
      await tx.insert(invoices).values({
        amount: totalPrice.toString(),
        orderId,
      });

      // Insert shipping
      await tx.insert(shippings).values({
        name: addressSelected.name,
        phone: addressSelected.phoneNumber,
        address: `${addressSelected.address}, ${addressSelected.district}, ${addressSelected.city}, ${addressSelected.province}, Indonesia ${addressSelected.postalCode}`,
        address_note: addressSelected.detail,
        latitude: addressSelected.latitude,
        longitude: addressSelected.longitude,
        courierCompany: orderDraftShippingsExist.company,
        courierType: orderDraftShippingsExist.type,
        duration: orderDraftShippingsExist.duration,
        price: orderDraftShippingsExist.price,
        courierName: orderDraftShippingsExist.label,
        orderId,
      });

      // Update stok
      await Promise.all(
        orderDraftItemsExist.map((item) =>
          tx
            .update(productVariants)
            .set({
              stock: sql`${productVariants.stock}::numeric - ${Number(item.quantity)}`,
            })
            .where(eq(productVariants.id, item.variantId))
        )
      );
    });

    // ==========================
    // 4️⃣ RETURN RESPONSE
    // ==========================
    return successRes(
      {
        orderId,
        payment_url: invoice.invoiceUrl,
        payment_status: invoice.status,
      },
      "Invoice successfully created"
    );
  } catch (error) {
    console.log(error);
    return errorRes("Internal Error", 500);
  }
}
