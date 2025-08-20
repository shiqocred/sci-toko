import { addToCart, cartsList, checkedCart } from "@/lib/api";
import { auth, errorRes, successRes } from "@/lib/auth";
import { isResponse } from "@/lib/utils";
import { NextRequest } from "next/server";

export async function GET() {
  try {
    const isAuth = await auth();
    if (!isAuth) return errorRes("Unauthorized", 401);

    const userId = isAuth.user.id;

    const response = await cartsList(userId);

    return successRes(response, "Carts list");
  } catch (error) {
    if (isResponse(error)) return error;
    console.error("ERROR_GET_CARTS", error);
    return errorRes("Internal Server Error", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const isAuth = await auth();
    if (!isAuth) return errorRes("Unauthorized", 401);

    const userId = isAuth.user.id;

    await addToCart(req, userId);

    return successRes(null, "Product successfully added to cart");
  } catch (error) {
    if (isResponse(error)) return error;
    console.log("ERROR_ADD_CART", error);
    return errorRes("Internal Error", 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const isAuth = await auth();
    if (!isAuth) return errorRes("Unauthorized", 401);

    const userId = isAuth.user.id;

    await checkedCart(req, userId);

    return successRes(null, "Cart successfully updated");
  } catch (error) {
    if (isResponse(error)) return error;
    console.log("ERROR_UPDATE_CART", error);
    return errorRes("Internal Error", 500);
  }
}
