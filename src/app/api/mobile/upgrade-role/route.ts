import { apiGetStatusRole } from "@/lib/api/upgrade-role";
import { errorRes, isAuth } from "@/lib/auth";
import { isResponse } from "@/lib/utils";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const auth = await isAuth(req);
    if (!auth || auth.email || auth.password || !auth.sub)
      return errorRes("Unauthorized", 401);

    const { sub: userId } = auth;

    const res = await apiGetStatusRole(req, userId);

    return res;
  } catch (error) {
    if (isResponse(error)) return error;

    console.log("ERROR_GET_STATUS_ROLE", error);
    return errorRes("Internal Error", 500);
  }
}
