import { apiGetStatusRole } from "@/lib/api/upgrade-role";
import { auth, errorRes } from "@/lib/auth";
import { isResponse } from "@/lib/utils";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const isAuth = await auth();

    if (!isAuth) throw errorRes("Unauthorized", 401);
    if (!isAuth.user.emailVerified)
      throw errorRes("Your email hasn't been verified", 422);

    const { id: userId } = isAuth.user;

    const res = await apiGetStatusRole(req, userId);

    return res;
  } catch (error) {
    if (isResponse(error)) return error;

    console.log("ERROR_GET_STATUS_ROLE", error);
    return errorRes("Internal Error", 500);
  }
}
