import { auth, errorRes, successRes } from "@/lib/auth";
import { NextRequest } from "next/server";
import { apiUpgradeToPetShop } from "@/lib/api";
import { isResponse } from "@/lib/utils";

export async function PUT(req: NextRequest) {
  try {
    const isAuth = await auth();
    if (!isAuth) throw errorRes("Unauthorized", 401);
    const { id: userId } = isAuth.user;

    const response = await apiUpgradeToPetShop(req, userId);

    return successRes(response, "Form successfully submited");
  } catch (error) {
    if (isResponse(error)) return error;

    console.log("ERROR_UPGRADE_ROLE_PETSHOP", error);
    return errorRes("Internal Error", 500);
  }
}
