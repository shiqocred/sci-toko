import { createOrder, getOrder } from "@/lib/api";
import { auth, errorRes, successRes } from "@/lib/auth";
import { isResponse } from "@/lib/utils";
import { NextRequest } from "next/server";

// --- API HANDLER ---
export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user?.id) throw errorRes("Unauthorized", 401);

    const userId = session.user.id;

    const response = await getOrder(userId);

    return successRes(response, "Orders retrieved with product thumbnails");
  } catch (error) {
    if (isResponse(error)) return error;
    console.error("ERROR_GET_ORDERS", error);
    return errorRes("Internal Server Error", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const isAuth = await auth();
    if (!isAuth) return errorRes("Unauthorized", 401);

    const userId = isAuth.user.id;

    const response = await createOrder(req, userId);

    return successRes(response, "Order successfully created");
  } catch (error) {
    if (isResponse(error)) return error;
    console.log(error);
    return errorRes("Internal Error", 500);
  }
}
