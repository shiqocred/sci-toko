import { addToCart, cartsList, checkedCart } from "@/lib/api";
import { errorRes, isAuth, successRes } from "@/lib/auth";
import { db } from "@/lib/db";
import { isResponse } from "@/lib/utils";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const auth = await isAuth(req);
    if (!auth || auth.email || auth.password || !auth.sub)
      throw errorRes("Unauthorized", 401);

    const { sub: userId } = auth;

    const user = await db.query.users.findFirst({
      columns: {
        role: true,
      },
      where: (u, { eq }) => eq(u.id, userId),
    });

    const response = await cartsList(userId, user?.role ?? "BASIC");

    return successRes(response, "Carts list");
  } catch (error) {
    if (isResponse(error)) return error;

    console.error("ERROR_GET_CARTS", error);
    return errorRes("Internal Server Error", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await isAuth(req);
    if (!auth || auth.email || auth.password || !auth.sub)
      throw errorRes("Unauthorized", 401);

    const { sub: userId } = auth;

    await addToCart(req, userId);

    return successRes(null, "Product successfully added to cart");
  } catch (error) {
    if (isResponse(error)) return error;

    console.error("ERROR_ADD_TO_CARTS", error);
    return errorRes("Internal Server Error", 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const auth = await isAuth(req);
    if (!auth || auth.email || auth.password || !auth.sub)
      throw errorRes("Unauthorized", 401);

    const { sub: userId } = auth;

    await checkedCart(req, userId);

    return successRes(null, "Cart successfully updated");
  } catch (error) {
    if (isResponse(error)) return error;

    console.error("ERROR_UPDATE_CARTS", error);
    return errorRes("Internal Server Error", 500);
  }
}
