import { r2Public } from "@/config";
import {
  db,
  orderItems,
  orders,
  productImages,
  products,
  productVariants,
} from "@/lib/db";
import { add, format } from "date-fns";
import { id } from "date-fns/locale";
import { desc, eq, sql } from "drizzle-orm";

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
      expired:
        row.status === "WAITING_PAYMENT" && row.created
          ? format(
              add(new Date(row.created), { seconds: 10800 }),
              "dd-LL-yyyy HH:mm",
              { locale: id }
            )
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
         ORDER BY ${productImages.createdAt} ASC 
         LIMIT 1)`.as("image"),
      variant_name: productVariants.name,
      variant_qty: orderItems.quantity,
      variant_price: orderItems.price,
      variant_isDefault: productVariants.isDefault,
      status: orders.status,
      total_price: orders.totalPrice,
      created: orders.createdAt,
    })
    .from(orders)
    .innerJoin(orderItems, eq(orderItems.orderId, orders.id))
    .innerJoin(productVariants, eq(productVariants.id, orderItems.variantId))
    .innerJoin(products, eq(products.id, productVariants.productId))
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
