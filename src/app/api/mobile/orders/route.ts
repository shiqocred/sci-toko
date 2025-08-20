import { createOrder, getOrder } from "@/lib/api";
import { errorRes, isAuth, successRes } from "@/lib/auth";
import { isResponse } from "@/lib/utils";
import { NextRequest } from "next/server";

// --- API HANDLER ---
export async function GET(req: NextRequest) {
  try {
    const auth = await isAuth(req);
    if (!auth || auth.email || auth.password || !auth.sub)
      throw errorRes("Unauthorized", 401);

    const { sub: userId } = auth;

    const response = await getOrder(userId);

    return successRes(response, "Orders retrieved with product thumbnails");
  } catch (error) {
    if (isResponse(error)) return error;
    console.error("ERROR_GET_ORDERS", error);
    return errorRes("Internal Server Error", 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const auth = await isAuth(req);
    if (!auth || auth.email || auth.password || !auth.sub)
      throw errorRes("Unauthorized", 401);

    const { sub: userId } = auth;

    const response = await createOrder(req, userId);

    return successRes(response, "Order successfully created");
  } catch (error) {
    if (isResponse(error)) return error;
    console.log(error);
    return errorRes("Internal Error", 500);
  }
}
