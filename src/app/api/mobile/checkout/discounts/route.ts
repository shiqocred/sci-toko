import { applyDiscount, removeDiscount } from "@/lib/api";
import { errorRes, isAuth, successRes } from "@/lib/auth";
import { isResponse } from "@/lib/utils";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const auth = await isAuth(req);
    if (!auth || auth.email || auth.password || !auth.sub)
      throw errorRes("Unauthorized", 401);

    const { sub: userId } = auth;

    await applyDiscount(req, userId);

    return successRes(null, "Discount applied");
  } catch (error) {
    if (isResponse(error)) return error;
    console.log("ERROR_APPLY_VOUCHER", error);
    return errorRes("Internal Error", 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await isAuth(req);
    if (!auth || auth.email || auth.password || !auth.sub)
      throw errorRes("Unauthorized", 401);

    const { sub: userId } = auth;

    await removeDiscount(userId);

    return successRes(null, "Discount removed");
  } catch (error) {
    if (isResponse(error)) return error;
    console.log("ERROR_REMOVED_VOUCHER", error);
    return errorRes("Internal Error", 500);
  }
}
