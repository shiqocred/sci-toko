import { cancelOrder, detailOrder } from "@/lib/api";
import { auth, errorRes, successRes } from "@/lib/auth";
import { isResponse } from "@/lib/utils";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) throw errorRes("Unauthorized", 401);

    const userId = session.user.id;

    const response = await detailOrder(params, userId);

    return successRes(response, "Order detail retrieved");
  } catch (error) {
    if (isResponse(error)) return error;
    console.error("ERROR_GET_ORDER", error);
    return errorRes("Internal Server Error", 500);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const isAuth = await auth();
    if (!isAuth) return errorRes("Unauthorized", 401);

    const userId = isAuth.user.id;

    const response = await cancelOrder(params, userId);

    return successRes(response, "Order successfully cancelled");
  } catch (error) {
    if (isResponse(error)) return error;
    console.error("ERROR_CANCEL_ORDER", error);
    return errorRes("Internal Error", 500);
  }
}
