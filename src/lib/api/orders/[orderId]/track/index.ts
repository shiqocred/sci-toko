import { errorRes } from "@/lib/auth";
import { db, shippingHistories } from "@/lib/db";
import { asc } from "drizzle-orm";

export const trackOrder = async (
  params: Promise<{ orderId: string }>,
  userId: string
) => {
  const { orderId } = await params;

  const orderIdExist = await db.query.orders.findFirst({
    where: (o, { eq, and }) => and(eq(o.id, orderId), eq(o.userId, userId)),
  });

  if (!orderIdExist) throw errorRes("Order not found");

  const shipping = await db.query.shippings.findFirst({
    columns: { id: true },
    where: (s, { eq }) => eq(s.orderId, orderId),
  });

  if (!shipping) throw errorRes("Shipping not found");

  const histories = await db.query.shippingHistories.findMany({
    where: (sh, { eq }) => eq(sh.shippingId, shipping.id),
    orderBy: asc(shippingHistories.updatedAt),
  });

  return histories;
};
