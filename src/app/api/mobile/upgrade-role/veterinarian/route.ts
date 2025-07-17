import { errorRes, isAuth, successRes } from "@/lib/auth";
import { NextRequest } from "next/server";
import { isResponse } from "@/lib/utils";
import { apiUpgradeToVeterinarian } from "@/lib/api/upgrade-role/veterinarian";

export async function PUT(req: NextRequest) {
  try {
    const auth = await isAuth(req);
    if (!auth || auth.email || auth.password || !auth.sub)
      return errorRes("Unauthorized", 401);

    const { sub: userId } = auth;

    const response = await apiUpgradeToVeterinarian(req, userId);

    return successRes(response, "Document successfully submited");
  } catch (error) {
    if (isResponse(error)) return error;
    console.log("ERROR_UPGRADE_ROLE_VETERINARIAN", error);
    return errorRes("Internal Error", 500);
  }
}
