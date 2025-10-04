import { failureXendit, r2Public, successXendit } from "@/config";
import { errorRes } from "@/lib/auth";
import {
  carts,
  db,
  invoices,
  orderDraft,
  orderDraftShippings,
  orderItems,
  orders,
  productImages,
  products,
  productVariants,
  shippings,
  testimonies,
} from "@/lib/db";
import { xendit } from "@/lib/utils";
import { createId } from "@paralleldrive/cuid2";
import { add, format } from "date-fns";
import { id } from "date-fns/locale";
import { and, desc, eq, inArray, isNotNull, sql } from "drizzle-orm";
import { NextRequest } from "next/server";

// --- TYPES ---
type Variant = {
  variant_name: string;
  variant_qty: string;
  variant_price: string;
};

type OrderItem = {
  product_id: string;
  product_name: string;
  image: string | null;
  default_variant: Variant | null;
  variants: Variant[] | null;
};

type TransformedOrderGroup = {
  id: string;
  status: string;
  total_price: string;
  expired: string | null;
  isReviewed: boolean;
  items: OrderItem[];
};

// --- HELPERS ---
const buildVariant = (row: any): Variant => ({
  variant_name: row.variant_name,
  variant_qty: row.variant_qty,
  variant_price: row.variant_price,
});

const getOrCreateOrder = (
  orderMap: Map<string, TransformedOrderGroup>,
  row: any
) => {
  let order = orderMap.get(row.id);
  if (!order) {
    order = {
      id: row.id,
      status: row.status,
      total_price: row.total_price,
      isReviewed: row.isReviewed,
      expired:
        row.status === "WAITING_PAYMENT" && row.expiredSoon
          ? row.expiredSoon.toISOString()
          : null,
      items: [],
    };
    orderMap.set(row.id, order);
  }
  return order;
};

const getOrCreateItem = (
  order: TransformedOrderGroup,
  row: any,
  variant: Variant
) => {
  let item = order.items.find((i) => i.product_id === row.product_id);
  if (!item) {
    item = {
      product_id: row.product_id,
      product_name: row.product_name,
      image: row.image ? `${r2Public}/${row.image as string}` : null,
      default_variant: row.variant_isDefault ? variant : null,
      variants: !row.variant_isDefault ? [variant] : null,
    };
    order.items.push(item);
  } else {
    if (row.variant_isDefault) {
      item.default_variant = variant;
    } else {
      item.variants = [...(item.variants || []), variant];
    }
  }
};

const groupByStatus = (orders: TransformedOrderGroup[]) => ({
  unpaid: orders.filter((o) => o.status === "WAITING_PAYMENT"),
  processed: orders.filter((o) => o.status === "PACKING"),
  shipping: orders.filter((o) => o.status === "SHIPPING"),
  completed: orders.filter((o) => o.status === "DELIVERED"),
  failed: orders.filter((o) => ["CANCELLED", "EXPIRED"].includes(o.status)),
});

// --- MAIN FUNCTION ---
export const getOrder = async (userId: string) => {
  const rows = await db
    .select({
      id: orders.id,
      product_id: products.id,
      product_name: products.name,
      image: sql`
        (SELECT ${productImages.url} 
         FROM ${productImages} 
         WHERE ${productImages.productId} = ${products.id} 
         ORDER BY ${productImages.position} ASC 
         LIMIT 1)`.as("image"),
      variant_name: productVariants.name,
      variant_qty: orderItems.quantity,
      variant_price: orderItems.price,
      variant_isDefault: productVariants.isDefault,
      status: orders.status,
      total_price: orders.totalPrice,
      expiredSoon: orders.willExpired,
      isReviewed: sql<boolean>`${isNotNull(testimonies.id)}`.as("isReviewed"),
    })
    .from(orders)
    .innerJoin(orderItems, eq(orderItems.orderId, orders.id))
    .innerJoin(productVariants, eq(productVariants.id, orderItems.variantId))
    .innerJoin(products, eq(products.id, productVariants.productId))
    .leftJoin(testimonies, eq(testimonies.orderId, orders.id))
    .where(eq(orders.userId, userId))
    .orderBy(desc(orders.createdAt));

  const orderMap = new Map<string, TransformedOrderGroup>();

  for (const row of rows) {
    const variant = buildVariant(row);
    const order = getOrCreateOrder(orderMap, row);
    getOrCreateItem(order, row, variant);
  }

  return groupByStatus(Array.from(orderMap.values()));
};

export const createOrder = async (req: NextRequest, userId: string) => {
  const { Invoice } = xendit;
  const { note, courierId } = await req.json();

  const userExist = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.id, userId),
  });

  if (!userExist) throw errorRes("Unauthorized", 401);
  if (!userExist.emailVerified) throw errorRes("Email not vefiried", 403);

  // Ambil orderDraft aktif sekaligus detail address dan shipping supaya 1x query
  const orderDraftExist = await db.query.orderDraft.findFirst({
    where: (od, { eq }) => eq(od.userId, userId),
    columns: {
      id: true,
      addressId: true,
      totalPrice: true,
      discountId: true,
      totalDiscount: true,
      freeShippingId: true,
    },
  });

  if (!orderDraftExist)
    throw errorRes("Failed to checkout, Order draft not found.", 400);
  const addressId = orderDraftExist.addressId;
  if (!addressId)
    throw errorRes("Failed to checkout, no address selected", 400);

  // Parallel fetch detail store, address, shipping, draft items
  const [
    storeDetail,
    addressSelected,
    orderDraftShippingsExist,
    orderDraftItemsExist,
  ] = await Promise.all([
    db.query.about.findFirst(),
    db.query.addresses.findFirst({
      where: (a, { eq }) => eq(a.id, addressId),
    }),
    db.query.orderDraftShippings.findFirst({
      where: (ods, { eq }) => eq(ods.id, courierId),
    }),
    db.query.orderDraftItems.findMany({
      where: (odi, { eq }) => eq(odi.orderDraftId, orderDraftExist.id),
    }),
  ]);

  if (!storeDetail)
    throw errorRes("Store detail not found, please contact sales", 400);
  if (!addressSelected)
    throw errorRes("Failed to checkout, no selected address found", 400);
  if (!orderDraftShippingsExist)
    throw errorRes("Failed to checkout, no selected shipping found", 400);
  if (!orderDraftItemsExist.length)
    throw errorRes("Failed to checkout, no items in draft", 400);

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
    throw errorRes("No items with sufficient stock to checkout", 400);
  }

  const shippingCost = orderDraftExist.freeShippingId
    ? 0
    : Number(orderDraftShippingsExist.price);

  const totalPrice =
    Number(orderDraftExist.totalPrice) +
    shippingCost -
    Number(orderDraftExist.totalDiscount);

  const orderId = createId();

  const invoice = await Invoice.createInvoice({
    data: {
      amount: totalPrice,
      currency: "IDR",
      externalId: orderId,
      successRedirectUrl: successXendit,
      failureRedirectUrl: failureXendit,
      invoiceDuration: Number(storeDetail.expired) * 60 * 60,
    },
  });

  if (!invoice) throw errorRes("error", 500);

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
      productPrice: orderDraftExist.totalPrice,
      shippingPrice: orderDraftShippingsExist.price,
      freeShippingId: orderDraftExist.freeShippingId,
      totalPrice: totalPrice.toString(),
      discountId: orderDraftExist.discountId,
      totalDiscount: orderDraftExist.totalDiscount,
      willExpired: add(new Date(), { hours: Number(storeDetail.expired) }),
      note,
    });

    // Update stok hanya untuk item yang cukup stok
    await Promise.all([
      // Insert orderItems hanya yang cukup stok
      await tx.insert(orderItems).values(
        itemsToCheckout.map((item) => ({
          orderId,
          variantId: item.variantId,
          price: item.price,
          weight: item.weight,
          quantity: item.quantity,
        }))
      ),

      // Insert invoice
      await tx.insert(invoices).values({
        amount: totalPrice.toString(),
        orderId,
        paymentId: invoice.id,
      }),

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
      }),
    ]);

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
    await Promise.all([
      tx
        .delete(carts)
        .where(
          and(eq(carts.userId, userId), inArray(carts.variantId, variantIds))
        ),
      tx.delete(orderDraft).where(eq(orderDraft.userId, userId)),
      tx
        .delete(orderDraftShippings)
        .where(eq(orderDraftShippings.userId, userId)),
    ]);
  });

  return {
    orderId,
    payment_url: invoice.invoiceUrl,
    payment_status: invoice.status,
  };
};
