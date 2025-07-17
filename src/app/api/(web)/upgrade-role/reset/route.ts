import { auth, errorRes, successRes } from "@/lib/auth";
import { isResponse } from "@/lib/utils";
import { apiResetUpgradeRole } from "@/lib/api/upgrade-role/reset";

export async function PUT() {
  try {
    const isAuth = await auth();
    if (!isAuth) throw errorRes("Unauthorized", 401);
    const { id: userId } = isAuth.user;

    await apiResetUpgradeRole(userId);

    return successRes(null, "Form successfully reseted");
  } catch (error) {
    if (isResponse(error)) return error;

    console.log("ERROR_UPGRADE_ROLE_RESET", error);
    return errorRes("Internal Error", 500);
  }
}
