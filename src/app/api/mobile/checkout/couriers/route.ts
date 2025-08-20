import { courier } from "@/lib/api";
import { errorRes, isAuth, successRes } from "@/lib/auth";
import { isResponse } from "@/lib/utils";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const auth = await isAuth(req);
    if (!auth || auth.email || auth.password || !auth.sub)
      throw errorRes("Unauthorized", 401);

    const { sub: userId } = auth;

    const { response, message } = await courier(userId);

    return successRes(response, message);
  } catch (error) {
    if (isResponse(error)) return error;
    console.error("Checkout Error", error);
    return errorRes("Internal server error", 500);
  }
}
