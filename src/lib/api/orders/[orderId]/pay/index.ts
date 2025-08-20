import { checkoutUrl } from "@/config";
import { errorRes } from "@/lib/auth";
import { db } from "@/lib/db";

export const repaymentOrder = async (
  params: Promise<{ orderId: string }>,
  userId: string
) => {
  const { orderId } = await params;

  const orderIdExist = await db.query.orders.findFirst({
    where: (o, { eq, and }) => and(eq(o.id, orderId), eq(o.userId, userId)),
  });

  if (!orderIdExist) throw errorRes("Order not found");

  const invoice = await db.query.invoices.findFirst({
    columns: { paymentId: true },
    where: (i, { eq }) => eq(i.orderId, orderId),
  });

  if (!invoice) throw errorRes("Invoice expired or not found");

  const response = {
    url: `${checkoutUrl}/${invoice?.paymentId}`,
  };

  return response;
};
