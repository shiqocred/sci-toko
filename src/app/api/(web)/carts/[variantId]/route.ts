import { deleteCart, quantityCart } from "@/lib/api";
import { auth, errorRes, successRes } from "@/lib/auth";
import { isResponse } from "@/lib/utils";
import { NextRequest } from "next/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ variantId: string }> }
) {
  try {
    const isAuth = await auth();
    if (!isAuth) return errorRes("Unauthorized", 401);

    const userId = isAuth.user.id;

    await quantityCart(req, params, userId);

    return successRes(null, `Quantity cart successfully updated`);
  } catch (error) {
    if (isResponse(error)) return error;
    console.error("ERROR_QUANTITY_CART", error);
    return errorRes("Internal Error", 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ variantId: string }> }
) {
  try {
    const isAuth = await auth();
    if (!isAuth) return errorRes("Unauthorized", 401);

    const userId = isAuth.user.id;

    await deleteCart(params, userId);

    return successRes(null, `Cart successfully deleted`);
  } catch (error) {
    if (isResponse(error)) return error;
    console.error("ERROR_DELETE_CART", error);
    return errorRes("Internal Error", 500);
  }
}
