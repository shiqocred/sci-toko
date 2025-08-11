import { auth, errorRes, successRes } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const session = await auth();
    if (!session) return errorRes("Unauthorized", 401);

    const { orderId } = await params;

    const shipping = await db.query.shippings.findFirst({
      columns: { id: true },
      where: (s, { eq }) => eq(s.orderId, orderId),
    });

    if (!shipping) return errorRes("Shipping Id not found");

    const histories = await db.query.shippingHistories.findMany({
      where: (sh, { eq }) => eq(sh.shippingId, shipping.id),
    });

    return successRes(histories, "Retrieve re-payment url");
  } catch (error) {
    console.error("ERROR_REPAYMENT", error);
    return errorRes("Internal Server Error", 500);
  }
}
