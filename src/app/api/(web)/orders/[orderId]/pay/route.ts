import { checkoutUrl } from "@/config";
import { auth, errorRes, successRes } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextRequest } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const session = await auth();
    if (!session) return errorRes("Unauthorized", 401);

    const { orderId } = await params;

    const invoice = await db.query.invoices.findFirst({
      columns: { paymentId: true },
      where: (i, { eq }) => eq(i.orderId, orderId),
    });

    const response = {
      url: `${checkoutUrl}/${invoice?.paymentId}`,
    };

    return successRes(response, "Retrieve re-payment url");
  } catch (error) {
    console.error("ERROR_REPAYMENT", error);
    return errorRes("Internal Server Error", 500);
  }
}
