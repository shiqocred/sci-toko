import { applyDiscount, removeDiscount } from "@/lib/api";
import { auth, errorRes, successRes } from "@/lib/auth";
import { isResponse } from "@/lib/utils";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return errorRes("Unauthorized", 401);

    const userId = session.user.id;

    await applyDiscount(req, userId);

    return successRes(null, "Discount applied");
  } catch (error) {
    if (isResponse(error)) return error;
    console.log("ERROR_APPLY_VOUCHER", error);
    return errorRes("Internal Error", 500);
  }
}

export async function DELETE() {
  try {
    const session = await auth();
    if (!session) return errorRes("Unauthorized", 401);

    const userId = session.user.id;

    await removeDiscount(userId);

    return successRes(null, "Discount removed");
  } catch (error) {
    if (isResponse(error)) return error;
    console.log("ERROR_REMOVED_VOUCHER", error);
    return errorRes("Internal Error", 500);
  }
}
