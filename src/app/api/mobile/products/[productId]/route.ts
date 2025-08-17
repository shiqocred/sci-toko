import { jwtSecret } from "@/config";
import { productDetail } from "@/lib/api";
import { errorRes, successRes } from "@/lib/auth";
import { db } from "@/lib/db";
import { isResponse } from "@/lib/utils";
import { verify } from "jsonwebtoken";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const authHeader = req.headers.get("authorization");
    let userId: string = "";

    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const auth: { sub: string; email: string; password: string } = verify(
        token,
        jwtSecret
      ) as { sub: string; email: string; password: string };

      const { sub } = auth;

      userId = sub;
    }

    const response = await productDetail(params, userId);

    return successRes(response, "Product detail");
  } catch (error) {
    if (isResponse(error)) return error;

    console.error("ERROR_GET_DETAIL_PRODUCT", error);
    return errorRes("Internal Error", 500);
  }
}
