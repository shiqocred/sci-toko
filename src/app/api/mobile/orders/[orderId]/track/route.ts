import { trackOrder } from "@/lib/api";
import { errorRes, isAuth, successRes } from "@/lib/auth";
import { isResponse } from "@/lib/utils";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const auth = await isAuth(req);
    if (!auth || auth.email || auth.password || !auth.sub)
      throw errorRes("Unauthorized", 401);

    const { sub: userId } = auth;

    const response = await trackOrder(params, userId);

    return successRes(response, "Retrieve track order");
  } catch (error) {
    if (isResponse(error)) return error;
    console.error("ERROR_GET_TRACK_ORDER", error);
    return errorRes("Internal Server Error", 500);
  }
}
