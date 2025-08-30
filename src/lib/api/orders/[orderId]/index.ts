import { r2Public } from "@/config";
import { errorRes } from "@/lib/auth";
import {
  db,
  invoices,
  orderItems,
  orders,
  productImages,
  products,
  productVariants,
  shippingHistories,
  shippings,
  testimonies,
} from "@/lib/db";
import { pronoun } from "@/lib/utils";
import { and, desc, eq, isNotNull, sql } from "drizzle-orm";

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
      total_discount: orders.totalDiscount,
      expiredAt: orders.expiredAt,
      cancelledAt: orders.cancelledAt,
      paidAt: orders.paidAt,
      shippingAt: orders.shippingAt,
      createdAt: orders.createdAt,
      deliveredAt: orders.deliveredAt,
      freeShippingId: orders.freeShippingId,
      invoice_status: invoices.status,
      paymentChannel: invoices.paymentChannel,
      paymentMethod: invoices.paymentMethod,
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
      isReviewed: sql<boolean>`${isNotNull(testimonies.id)}`.as("isReviewed"),
    })
    .from(orders)
    .leftJoin(invoices, eq(invoices.orderId, orders.id))
    .leftJoin(shippings, eq(shippings.orderId, orders.id))
    .leftJoin(testimonies, eq(testimonies.orderId, orders.id))
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
         ORDER BY ${productImages.position} ASC 
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
      discount: orderRes.total_discount,
      total: orderRes.total_price,
      method: formatPayment(orderRes.paymentMethod, orderRes.paymentChannel),
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
      isFreeShipping: !!orderRes.freeShippingId,
    },
    timestamp: {
      expiredAt: orderRes.expiredAt,
      cancelledAt: orderRes.cancelledAt,
      paidAt: orderRes.paidAt,
      shippingAt: orderRes.shippingAt,
      createdAt: orderRes.createdAt,
      deliveredAt: orderRes.deliveredAt,
    },
    products: productsList,
    history: history ?? null,
    isReviewed: orderRes.isReviewed,
  };
};

export const cancelOrder = async (
  params: Promise<{ orderId: string }>,
  userId: string
) => {
  const { orderId } = await params;

  await db
    .update(orders)
    .set({
      status: "CANCELLED",
      cancelledAt: sql`NOW()`,
      updatedAt: sql`NOW()`,
    })
    .where(and(eq(orders.id, orderId), eq(orders.userId, userId)));

  return { id: orderId };
};
