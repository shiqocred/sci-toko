import { baseUrl, r2Public } from "@/config";
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

    // Update semua orderDraft aktif jadi ABANDONED
    await db
      .update(orderDraft)
      .set({ status: "ABANDONED" })
      .where(
        and(eq(orderDraft.userId, userId), eq(orderDraft.status, "ACTIVE"))
      );

    // Hapus orderDraftShippings user
    await db
      .delete(orderDraftShippings)
      .where(eq(orderDraftShippings.userId, userId));

    // Ambil alamat default user dan variant sekaligus (bisa paralel)
    const [addressDefault, variantSelected] = await Promise.all([
      db.query.addresses.findFirst({
        where: (a, { eq, and }) =>
          and(eq(a.userId, userId), eq(a.isDefault, true)),
      }),
      db
        .select({
          variantId: carts.variantId,
          qty: carts.quantity,
          basicPrice: productVariants.basicPrice,
          petShopPrice: productVariants.petShopPrice,
          doctorPrice: productVariants.doctorPrice,
          weight: productVariants.weight,
          stock: productVariants.stock,
        })
        .from(carts)
        .leftJoin(productVariants, eq(carts.variantId, productVariants.id))
        .where(and(eq(carts.userId, userId), eq(carts.checked, true))),
    ]);

    // Filter variant dengan stok > 0 dan qty <= stok
    const variantWithSufficientStock = variantSelected.filter(
      ({ stock, qty }) => {
        const s = Number(stock ?? 0);
        const q = Number(qty ?? 0);
        return s > 0 && q <= s;
      }
    );

    if (variantWithSufficientStock.length === 0) {
      return errorRes("No items with sufficient stock to create checkout", 400);
    }

    // Function format price sekali saja
    const getPrice = (item: (typeof variantWithSufficientStock)[0]) => {
      if (userRole === "PETSHOP") return Number(item.petShopPrice);
      if (userRole === "VETERINARIAN") return Number(item.doctorPrice);
      return Number(item.basicPrice);
    };

    // Hitung total berat dan harga secara reduce 1x saja
    let totalWeight = 0;
    let totalPrice = 0;
    for (const item of variantWithSufficientStock) {
      const qty = Number(item.qty ?? 0);
      totalWeight += Number(item.weight ?? 0) * qty;
      totalPrice += getPrice(item) * qty;
    }

    const orderDraftId = createId();

    // Insert orderDraft baru
    await db.insert(orderDraft).values({
      id: orderDraftId,
      userId,
      totalPrice: totalPrice.toString(),
      addressId: addressDefault?.id,
      totalWeight: totalWeight.toString(),
      status: "ACTIVE",
    });

    // Insert orderDraftItems hanya untuk variant yang stok cukup
    await db.insert(orderDraftItems).values(
      variantWithSufficientStock.map((item) => ({
        orderDraftId,
        variantId: item.variantId,
        price: getPrice(item).toString(),
        quantity: item.qty,
        weight: item.weight ?? "0",
      }))
    );

    // **Catatan: Tidak ada penghapusan cart di sini lagi**

    return successRes(null, "Checkout created");
  } catch (error) {
    console.log("ERROR_CREATE_CHECKOUT", error);
    return errorRes("Internal Error", 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { Invoice } = xendit;
    const isAuth = await auth();
    if (!isAuth) return errorRes("Unauthorized", 401);

    const userId = isAuth.user.id;

    const { note } = await req.json();

    // Ambil orderDraft aktif sekaligus detail address dan shipping supaya 1x query
    const orderDraftExist = await db.query.orderDraft.findFirst({
      where: (od, { eq, and }) =>
        and(eq(od.userId, userId), eq(od.status, "ACTIVE")),
      columns: { id: true, addressId: true, totalPrice: true },
    });

    if (!orderDraftExist)
      return errorRes("Failed to checkout, Order draft not found.", 400);
    const addressId = orderDraftExist.addressId;
    if (!addressId)
      return errorRes("Failed to checkout, no address selected", 400);

    // Parallel fetch detail store, address, shipping, draft items
    const [
      storeDetail,
      addressSelected,
      orderDraftShippingsExist,
      orderDraftItemsExist,
    ] = await Promise.all([
      db.query.storeDetail.findFirst(),
      db.query.addresses.findFirst({
        where: (a, { eq, and }) =>
          and(eq(a.id, addressId), eq(a.userId, userId)),
      }),
      db.query.orderDraftShippings.findFirst({
        where: (ods, { eq, and }) =>
          and(eq(ods.orderDraftId, orderDraftExist.id), eq(ods.userId, userId)),
      }),
      db.query.orderDraftItems.findMany({
        where: (odi, { eq }) => eq(odi.orderDraftId, orderDraftExist.id),
      }),
    ]);

    if (!storeDetail)
      return errorRes("Store detail not found, please contact sales", 400);
    if (!addressSelected)
      return errorRes("Failed to checkout, no selected address found", 400);
    if (!orderDraftShippingsExist)
      return errorRes("Failed to checkout, no selected shipping found", 400);
    if (!orderDraftItemsExist.length)
      return errorRes("Failed to checkout, no items in draft", 400);

    // Ambil stok varian sekaligus
    const variantIds = orderDraftItemsExist.map((item) => item.variantId);
    const variantsStock = await db.query.productVariants.findMany({
      where: (pv, { inArray }) => inArray(pv.id, variantIds),
      columns: { id: true, stock: true },
    });

    // Filter item dengan stok cukup (stok > 0 dan qty <= stok)
    const insufficientStock = new Set(
      orderDraftItemsExist
        .filter((item) => {
          const variant = variantsStock.find((v) => v.id === item.variantId);
          return (
            variant &&
            Number(variant.stock) > 0 &&
            Number(item.quantity) > Number(variant.stock)
          );
        })
        .map((item) => item.variantId)
    );

    const itemsToCheckout = orderDraftItemsExist.filter(
      (item) => !insufficientStock.has(item.variantId)
    );

    if (itemsToCheckout.length === 0) {
      return errorRes("No items with sufficient stock to checkout", 400);
    }

    const totalProductPrice = itemsToCheckout.reduce(
      (sum, item) => sum + Number(item.price) * Number(item.quantity),
      0
    );

    const totalPrice =
      totalProductPrice + Number(orderDraftShippingsExist.price);

    const orderId = createId();

    const invoice = await Invoice.createInvoice({
      data: {
        amount: totalPrice,
        currency: "IDR",
        externalId: orderId,
        successRedirectUrl: `${baseUrl}/account?order=processed`,
        failureRedirectUrl: `${baseUrl}/account`,
        invoiceDuration: 10800,
      },
    });

    console.log(invoice);

    await db.transaction(async (tx) => {
      // Lock variant yang dicekout
      await Promise.all(
        itemsToCheckout.map((item) =>
          tx.execute(
            sql`SELECT * FROM product_variants WHERE id = ${item.variantId} FOR UPDATE`
          )
        )
      );

      // Insert order utama
      await tx.insert(orders).values({
        id: orderId,
        userId,
        productPrice: totalProductPrice.toString(),
        shippingPrice: orderDraftShippingsExist.price,
        totalPrice: totalPrice.toString(),
        note,
      });

      // Update orderDraft jadi CHECKOUTED
      await tx
        .update(orderDraft)
        .set({ status: "CHECKOUTED" })
        .where(eq(orderDraft.id, orderDraftExist.id));

      // Insert orderItems hanya yang cukup stok
      await tx.insert(orderItems).values(
        itemsToCheckout.map((item) => ({
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
        paymentId: invoice.id,
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
        fastestEstimate: orderDraftShippingsExist.fastestEstimate,
        longestEstimate: orderDraftShippingsExist.longestEstimate,
        duration: orderDraftShippingsExist.duration,
        price: orderDraftShippingsExist.price,
        courierName: orderDraftShippingsExist.label,
        orderId,
      });

      // Update stok hanya untuk item yang cukup stok
      await Promise.all(
        itemsToCheckout.map((item) =>
          tx
            .update(productVariants)
            .set({
              stock: sql`${productVariants.stock}::numeric - ${Number(item.quantity)}`,
            })
            .where(eq(productVariants.id, item.variantId))
        )
      );

      // Hapus cart user untuk variant yang sudah dicekout
      await tx
        .delete(carts)
        .where(
          and(eq(carts.userId, userId), inArray(carts.variantId, variantIds))
        );
    });

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
