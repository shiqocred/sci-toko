import { r2Public } from "@/config";
import { auth, errorRes, successRes } from "@/lib/auth";
import {
  db,
  orderItems,
  orders,
  products,
  productVariants,
  productImages,
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
  image: string | null; // 👈 tetap ada, tapi diisi dari productImages
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
function buildVariant(row: any): Variant {
  return {
    variant_name: row.variant_name,
    variant_qty: row.variant_qty,
    variant_price: row.variant_price,
  };
}

function findOrCreateOrderByID(
  grouped: TransformedOrderGroup[],
  row: any,
  variantData: Variant
): TransformedOrderGroup {
  let orderGroup = grouped.find((order) => order.id === row.id);

  if (!orderGroup) {
    orderGroup = {
      id: row.id,
      status: row.status,
      total_price: row.total_price,
      expired:
        row.status === "WAITING_PAYMENT"
          ? format(
              add(new Date(row.created), { seconds: 10800 }),
              "dd-LL-yyyy HH:mm",
              { locale: id }
            )
          : null,
      items: [],
    };
    grouped.push(orderGroup);
  }

  let item = orderGroup.items.find((i) => i.product_id === row.product_id);

  if (!item) {
    item = {
      product_id: row.product_id,
      product_name: row.product_name,
      image: row.image ? `${r2Public}/${row.image}` : null, // 👈 dari LEFT JOIN productImages
      default_variant: row.variant_isDefault ? variantData : null,
      variants: !row.variant_isDefault ? [variantData] : null,
    };
    orderGroup.items.push(item);
  } else if (row.variant_isDefault) {
    item.default_variant = variantData;
  } else {
    if (!item.variants) {
      item.variants = [];
    }
    item.variants.push(variantData);
  }

  return orderGroup;
}

function groupByStatus(groupedOrders: TransformedOrderGroup[]) {
  return {
    unpaid: groupedOrders.filter((order) => order.status === "WAITING_PAYMENT"),
    processed: groupedOrders.filter((order) => order.status === "PACKING"),
    shipping: groupedOrders.filter((order) => order.status === "SHIPPING"),
    completed: groupedOrders.filter((order) => order.status === "DELIVERED"),
    failed: groupedOrders.filter(
      (order) => order.status === "CANCELLED" || order.status === "EXPIRED"
    ),
  };
}

// --- API HANDLER ---
export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user?.id) return errorRes("Unauthorized", 401);

    const userId = session.user.id;

    const orderExists = await db
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

    const groupedByOrder: TransformedOrderGroup[] = [];

    for (const row of orderExists) {
      const variantData = buildVariant(row);
      findOrCreateOrderByID(groupedByOrder, row, variantData);
    }

    const result = groupByStatus(groupedByOrder);

    return successRes(result, "Orders retrieved with product thumbnails");
  } catch (error) {
    console.error("ERROR_GET_ORDERS", error);
    return errorRes("Internal Server Error", 500);
  }
}
