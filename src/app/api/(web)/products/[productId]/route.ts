import { productDetail } from "@/lib/api";
import { auth, errorRes, successRes } from "@/lib/auth";
import { isResponse } from "@/lib/utils";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const isAuth = await auth();
    const userId = isAuth?.user.id;

    const response = await productDetail(params, userId);

    return successRes(response, "Product detail");
  } catch (error) {
    if (isResponse(error)) return error;

    console.error("ERROR_GET_DETAIL_PRODUCT", error);
    return errorRes("Internal Error", 500);
  }
}
