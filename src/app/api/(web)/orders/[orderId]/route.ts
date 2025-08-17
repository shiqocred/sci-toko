import { r2Public } from "@/config";
import { auth, errorRes, successRes } from "@/lib/auth";
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
} from "@/lib/db";
import { and, desc, eq, sql } from "drizzle-orm";
import { NextRequest } from "next/server";

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

type HistoriesExist = {
  id: string;
  updatedAt: Date | null;
  status:
    | "CONFIRMED"
    | "SCHEDULED"
    | "ALLOCATED"
    | "PICKING_UP"
    | "PICKED"
    | "CANCELLED"
    | "ON_HOLD"
    | "DROPPING_OFF"
    | "RETURN_IN_TRANSIT"
    | "RETURNED"
    | "REJECTED"
    | "DISPOSED"
    | "COURIER_NOT_FOUND"
    | "DELIVERED"
    | "PENDING";
  shippingId: string;
  note: string | null;
  serviceType: string | null;
};

const formatStatus = (
  status:
    | "WAITING_PAYMENT"
    | "PACKING"
    | "SHIPPING"
    | "DELIVERED"
    | "EXPIRED"
    | "CANCELLED"
) => {
  if (status === "WAITING_PAYMENT") return "waiting payment";
  if (status === "PACKING") return "processed";
  if (status === "SHIPPING") return "shipping";
  if (status === "DELIVERED") return "delivered";
  if (status === "EXPIRED") return "expired";
  return "canceled";
};

const formatVariant = async (
  variants: {
    product_id: string | null;
    product_name: string | null;
    product_image: unknown;
    variant_id: string;
    variant_name: string | null;
    variant_price: string;
    variant_quantity: string;
    variant_is_default: boolean | null;
  }[]
) => {
  const productsRes: Record<string, ProductOutput> = {};

  for (const item of variants) {
    if (!item.product_id) return;
    if (!productsRes[item.product_id]) {
      productsRes[item.product_id] = {
        id: item.product_id,
        name: item.product_name,
        image: item.product_image ? `${r2Public}/${item.product_image}` : null,
        default_variant: null,
        variant: null,
      };
    }

    const variantObj: Variant = {
      id: item.variant_id,
      name: item.variant_name,
      price: item.variant_price,
      quantity: item.variant_quantity,
    };

    if (item.variant_is_default) {
      productsRes[item.product_id].default_variant = variantObj;
    } else {
      if (!productsRes[item.product_id].variant) {
        productsRes[item.product_id].variant = [];
      }
      productsRes[item.product_id].variant!.push(variantObj);
    }
  }

  return productsRes;
};

const formatPayment = async (method: string | null, channel: string | null) => {
  if (!method || !channel) return null;

  if (method === "BANK_TRANSFER") {
    if (channel === "BRI") return "Bank BRI";
    if (channel === "BSI") return "Bank BSI";
    if (channel === "BCA") return "Bank BCA";
    if (channel === "BNI") return "Bank BNI";
    if (channel === "BJB") return "Bank BJB";
    if (channel === "BNC") return "Bank Neo";
    if (channel === "PERMATA") return "Bank Permata";
    if (channel === "SAMPOERNA") return "Bank Samoerna";
    if (channel === "CIMB") return "Bank CIMB Niaga";
    if (channel === "MANDIRI") return "Bank Mandiri";
    return "Bank Muamalat";
  }
  if (method === "CREDIT_CARD") return "Credit Card";
  if (method === "EWALLET") {
    if (channel === "SHOPEEPAY") return "ShopeePay";
    if (channel === "ASTRAPAY") return "AstraPay";
    if (channel === "JENIUSPAY") return "JeniusPay";
    if (channel === "DANA") return "DANA";
    if (channel === "LINKAJA") return "Link Aja";
    if (channel === "OVO") return "OVO";
    if (channel === "GOPAY") return "GOPAY";
    return "Nex Cash";
  }
  if (method === "DIRECT_DEBIT") {
    if (channel === "DD_MANDIRI") return "Direct Debit Mandiri";
    return "Direct Debit BRI";
  }
  return "QRIS";
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) return errorRes("Unauthorized", 401);

    const { orderId } = await params;

    console.log(orderId);

    const [orderRes] = await db
      .select({
        id: orders.id,
        product_price: orders.productPrice,
        total_price: orders.totalPrice,
        status: orders.status,
        invoice_status: invoices.status,
        paymentChannel: invoices.paymentChannel,
        paymentMethod: invoices.paymentMethod,
        amount: invoices.amount,
        expiredAt: invoices.expiredAt,
        cancelledAt: invoices.cancelledAt,
        paidAt: invoices.paidAt,
        shipping_id: shippings.id,
        shipping_name: shippings.name,
        shipping_phone: shippings.phone,
        shipping_address: shippings.address,
        shipping_address_note: shippings.address_note,
        shipping_latitude: shippings.latitude,
        shipping_longitude: shippings.longitude,
        shipping_waybill_id: shippings.waybillId,
        shipping_courier_name: shippings.courierName,
        shipping_courierCompany: shippings.courierCompany,
        shipping_courierType: shippings.courierType,
        shipping_price: orders.shippingPrice,
        shipping_duration: shippings.duration,
        shipping_fastest: shippings.fastestEstimate,
        shipping_longest: shippings.longestEstimate,
        shipping_status: shippings.status,
      })
      .from(orders)
      .leftJoin(invoices, eq(invoices.orderId, orders.id))
      .leftJoin(shippings, eq(shippings.orderId, orders.id))
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!orderRes) return errorRes("Order not found", 400);

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

    const shippingId = orderRes.shipping_id;

    let history: HistoriesExist | null = null;

    if (shippingId) {
      const historiesExist = await db.query.shippingHistories.findFirst({
        where: (sh, { eq }) => eq(sh.shippingId, shippingId),
        orderBy: desc(shippingHistories.updatedAt),
      });

      history = historiesExist!;
    }

    const productRes = await formatVariant(orderItemsRes);

    const resultProduct = productRes ? Object.values(productRes) : [];

    const response = {
      ...{
        ...orderRes,
        status: formatStatus(orderRes.status),
        payment_formatted: await formatPayment(
          orderRes.paymentMethod,
          orderRes.paymentChannel
        ),
      },
      products: resultProduct,
      history: history ?? null,
    };

    return successRes(response, "Order detail retrieved");
  } catch (error) {
    console.error("ERROR_GET_ORDER", error);
    return errorRes("Internal Server Error", 500);
  }
}
