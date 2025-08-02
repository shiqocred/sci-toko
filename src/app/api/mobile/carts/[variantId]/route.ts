import { deleteCart, quantityCart } from "@/lib/api";
import { errorRes, isAuth, successRes } from "@/lib/auth";
import { isResponse } from "@/lib/utils";
import { NextRequest } from "next/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ variantId: string }> }
) {
  try {
    const auth = await isAuth(req);
    if (!auth || auth.email || auth.password || !auth.sub)
      throw errorRes("Unauthorized", 401);

    const { sub: userId } = auth;

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
    const auth = await isAuth(req);
    if (!auth || auth.email || auth.password || !auth.sub)
      throw errorRes("Unauthorized", 401);

    const { sub: userId } = auth;

    await deleteCart(params, userId);

    return successRes(null, `Cart successfully deleted`);
  } catch (error) {
    if (isResponse(error)) return error;
    console.error("ERROR_DELETE_CART", error);
    return errorRes("Internal Error", 500);
  }
}
