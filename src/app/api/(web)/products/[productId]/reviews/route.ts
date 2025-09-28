import { productReviews } from "@/lib/api";
import { errorRes, successRes } from "@/lib/auth";
import { isResponse } from "@/lib/utils";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const response = await productReviews(params);

    return successRes(response, "Product reviews");
  } catch (error) {
    if (isResponse(error)) return error;

    console.error("ERROR_GET_REVIEW_PRODUCT", error);
    return errorRes("Internal Error", 500);
  }
}
