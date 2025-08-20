import { failureXendit, r2Public, successXendit } from "@/config";
import { errorRes } from "@/lib/auth";
import {
  carts,
  db,
  invoices,
  orderDraft,
  orderItems,
  orders,
  productImages,
  products,
  productVariants,
  shippingHistories,
  shippings,
} from "@/lib/db";
import { pronoun, xendit } from "@/lib/utils";
import { createId } from "@paralleldrive/cuid2";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { NextRequest } from "next/server";

// --- TYPES ---
type Variant = {
  id: string;
  name: string | null;
  price: string;
  quantity: string;
};

type ProductOutput = {
  id: string | null;
  name: string | null;
  image: string | null;
  default_variant: Variant | null;
  variant: Variant[] | null;
};

// --- HELPERS ---
const STATUS_MAP: Record<string, string> = {
  WAITING_PAYMENT: "waiting payment",
  PACKING: "processed",
  SHIPPING: "shipping",
  DELIVERED: "delivered",
  EXPIRED: "expired",
  CANCELLED: "canceled",
};

const BANK_MAP: Record<string, string> = {
  BRI: "Bank BRI",
  BSI: "Bank BSI",
  BCA: "Bank BCA",
  BNI: "Bank BNI",
  BJB: "Bank BJB",
  BNC: "Bank Neo",
  PERMATA: "Bank Permata",
  SAMPOERNA: "Bank Samoerna",
  CIMB: "Bank CIMB Niaga",
  MANDIRI: "Bank Mandiri",
  MUAMALAT: "Bank Muamalat",
};

const EWALLET_MAP: Record<string, string> = {
  SHOPEEPAY: "ShopeePay",
  ASTRAPAY: "AstraPay",
  JENIUSPAY: "JeniusPay",
  DANA: "DANA",
  LINKAJA: "Link Aja",
  OVO: "OVO",
  GOPAY: "GOPAY",
  NEXCASH: "Nex Cash",
};

const formatStatus = (status: string) =>
  STATUS_MAP[status] ?? status.toLowerCase();

const formatPayment = (method: string | null, channel: string | null) => {
  if (!method || !channel) return null;
  if (method === "BANK_TRANSFER") return BANK_MAP[channel] ?? "Bank Muamalat";
  if (method === "EWALLET") return EWALLET_MAP[channel] ?? "Nex Cash";
  if (method === "CREDIT_CARD") return "Credit Card";
  if (method === "DIRECT_DEBIT")
    return channel === "DD_MANDIRI"
      ? "Direct Debit Mandiri"
      : "Direct Debit BRI";
  if (method === "QR_CODE" && channel === "QRIS") return "QRIS";
  return "ADMIN";
};

const formatVariant = (
  variants: Array<{
    product_id: string | null;
    product_name: string | null;
    product_image: unknown;
    variant_id: string;
    variant_name: string | null;
    variant_price: string;
    variant_quantity: string;
    variant_is_default: boolean | null;
  }>
) => {
  return variants.reduce<Record<string, ProductOutput>>((acc, item) => {
    if (!item.product_id) return acc;

    const product = acc[item.product_id] ?? {
      id: item.product_id,
      name: item.product_name,
      image: item.product_image ? `${r2Public}/${item.product_image}` : null,
      default_variant: null,
      variant: [],
    };

    const variantObj: Variant = {
      id: item.variant_id,
      name: item.variant_name,
      price: item.variant_price,
      quantity: item.variant_quantity,
    };

    if (item.variant_is_default) product.default_variant = variantObj;
    else product.variant!.push(variantObj);

    acc[item.product_id] = product;
    return acc;
  }, {});
};

const formatShippingDuration = (
  fastest: string | null,
  longest: string | null,
  unit?: string | null
) => {
  if (!unit) return "";
  if (fastest === longest)
    return `${fastest} ${unit.toLowerCase()}${pronoun(Number(fastest))}`;
  return `${fastest} - ${longest} ${unit.toLowerCase()}${pronoun(Number(longest))}`;
};

const getPaymentTimestamp = (order: any) => {
  if (order.invoice_status === "EXPIRED") return order.expiredAt;
  if (order.invoice_status === "CANCELLED") return order.cancelledAt;
  return order.paidAt;
};

// --- MAIN FUNCTION ---
export const detailOrder = async (
  params: Promise<{ orderId: string }>,
  userId: string
) => {
  const { orderId } = await params;

  const [orderRes] = await db
    .select({
      id: orders.id,
      product_price: orders.productPrice,
      total_price: orders.totalPrice,
      status: orders.status,
      invoice_status: invoices.status,
      paymentChannel: invoices.paymentChannel,
      paymentMethod: invoices.paymentMethod,
      expiredAt: invoices.expiredAt,
      cancelledAt: invoices.cancelledAt,
      paidAt: invoices.paidAt,
      shipping_id: shippings.id,
      shipping_name: shippings.name,
      shipping_phone: shippings.phone,
      shipping_address: shippings.address,
      shipping_address_note: shippings.address_note,
      shipping_waybill_id: shippings.waybillId,
      shipping_courier_name: shippings.courierName,
      shipping_price: orders.shippingPrice,
      shipping_duration: shippings.duration,
      shipping_fastest: shippings.fastestEstimate,
      shipping_longest: shippings.longestEstimate,
      shipping_status: shippings.status,
    })
    .from(orders)
    .leftJoin(invoices, eq(invoices.orderId, orders.id))
    .leftJoin(shippings, eq(shippings.orderId, orders.id))
    .where(and(eq(orders.id, orderId), eq(orders.userId, userId)))
    .limit(1);

  if (!orderRes) throw errorRes("Order not found", 400);

  const orderItemsRes = await db
    .select({
      product_id: products.id,
      product_name: products.name,
      product_image: sql`
        (SELECT ${productImages.url} 
         FROM ${productImages} 
         WHERE ${productImages.productId} = ${products.id} 
         ORDER BY ${productImages.createdAt} ASC 
         LIMIT 1)`.as("product_image"),
      variant_id: orderItems.variantId,
      variant_name: productVariants.name,
      variant_price: orderItems.price,
      variant_quantity: orderItems.quantity,
      variant_is_default: productVariants.isDefault,
    })
    .from(orderItems)
    .leftJoin(productVariants, eq(productVariants.id, orderItems.variantId))
    .leftJoin(products, eq(products.id, productVariants.productId))
    .where(eq(orderItems.orderId, orderId));

  const productRes = formatVariant(orderItemsRes);
  const productsList = productRes ? Object.values(productRes) : [];

  const shippingId = orderRes.shipping_id;
  const history = shippingId
    ? await db.query.shippingHistories.findFirst({
        where: (sh) => eq(sh.shippingId, shippingId),
        orderBy: desc(shippingHistories.updatedAt),
      })
    : null;

  return {
    id: orderRes.id,
    status: formatStatus(orderRes.status),
    payment: {
      subtotal: orderRes.product_price,
      shipping_cost: orderRes.shipping_price,
      total: orderRes.total_price,
      status: orderRes.invoice_status,
      timestamp: getPaymentTimestamp(orderRes),
    },
    address: {
      name: orderRes.shipping_name,
      phone: orderRes.shipping_phone,
      address: orderRes.shipping_address,
      note: orderRes.shipping_address_note,
    },
    shipping: {
      waybill_id: orderRes.shipping_waybill_id,
      courier_name: orderRes.shipping_courier_name,
      duration: formatShippingDuration(
        orderRes.shipping_fastest,
        orderRes.shipping_longest,
        orderRes.shipping_duration
      ),
      status: orderRes.shipping_status,
      method: formatPayment(orderRes.paymentMethod, orderRes.paymentChannel),
    },
    products: productsList,
    history: history ?? null,
  };
};

export const createOrder = async (req: NextRequest, userId: string) => {
  const { Invoice } = xendit;
  const { note } = await req.json();

  // Ambil orderDraft aktif sekaligus detail address dan shipping supaya 1x query
  const orderDraftExist = await db.query.orderDraft.findFirst({
    where: (od, { eq, and }) =>
      and(eq(od.userId, userId), eq(od.status, "ACTIVE")),
    columns: { id: true, addressId: true, totalPrice: true },
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
    db.query.storeDetail.findFirst(),
    db.query.addresses.findFirst({
      where: (a, { eq }) => eq(a.id, addressId),
    }),
    db.query.orderDraftShippings.findFirst({
      where: (ods, { eq }) => eq(ods.orderDraftId, orderDraftExist.id),
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

  const totalProductPrice = itemsToCheckout.reduce(
    (sum, item) => sum + Number(item.price) * Number(item.quantity),
    0
  );

  const totalPrice = totalProductPrice + Number(orderDraftShippingsExist.price);

  const orderId = createId();

  const invoice = await Invoice.createInvoice({
    data: {
      amount: totalPrice,
      currency: "IDR",
      externalId: orderId,
      successRedirectUrl: successXendit,
      failureRedirectUrl: failureXendit,
      invoiceDuration: 10800,
    },
  });

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

    // Update stok hanya untuk item yang cukup stok
    await Promise.all([
      // Update orderDraft jadi CHECKOUTED
      await tx
        .update(orderDraft)
        .set({ status: "CHECKOUTED" })
        .where(eq(orderDraft.id, orderDraftExist.id)),

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
    await tx
      .delete(carts)
      .where(
        and(eq(carts.userId, userId), inArray(carts.variantId, variantIds))
      );
  });

  return {
    orderId,
    payment_url: invoice.invoiceUrl,
    payment_status: invoice.status,
  };
};
