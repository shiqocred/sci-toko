import { errorRes, isAuth, successRes } from "@/lib/auth";
import { NextRequest } from "next/server";
import { isResponse } from "@/lib/utils";
import { apiResetUpgradeRole } from "@/lib/api/upgrade-role/reset";

export async function PUT(req: NextRequest) {
  try {
    const auth = await isAuth(req);
    if (!auth || auth.email || auth.password || !auth.sub)
      return errorRes("Unauthorized", 401);

    const { sub: userId } = auth;

    await apiResetUpgradeRole(userId);

    return successRes(null, "Form successfully reseted");
  } catch (error) {
    if (isResponse(error)) return error;

    console.log("ERROR_UPGRADE_ROLE_RESET", error);
    return errorRes("Internal Error", 500);
  }
}
