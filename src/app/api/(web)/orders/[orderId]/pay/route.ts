import { repaymentOrder } from "@/lib/api";
import { auth, errorRes, successRes } from "@/lib/auth";
import { isResponse } from "@/lib/utils";
import { NextRequest } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) throw errorRes("Unauthorized", 401);

    const userId = session.user.id;

    const response = await repaymentOrder(params, userId);

    return successRes(response, "Retrieve re-payment url");
  } catch (error) {
    if (isResponse(error)) return error;
    console.error("ERROR_REPAYMENT", error);
    return errorRes("Internal Server Error", 500);
  }
}
