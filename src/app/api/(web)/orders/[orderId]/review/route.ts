import { auth, errorRes, successRes } from "@/lib/auth";
import { isResponse } from "@/lib/utils";
import { NextRequest } from "next/server";
import { getReview, submitReview } from "@/lib/api";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const session = await auth();
    if (!session) return errorRes("Unauthorized", 401);

    const userId = session.user.id;

    const response = await getReview(userId, orderId);

    return successRes(response, "Retrieve testimoni");
  } catch (error) {
    if (isResponse(error)) return error;
    console.error("ERROR_GET_REVIEW_ORDER", error);
    return errorRes("Internal Server Error", 500);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const session = await auth();
    if (!session) return errorRes("Unauthorized", 401);

    const userId = session.user.id;

    await submitReview(req, userId, orderId);

    return successRes({ orderId }, "Review submitted");
  } catch (error) {
    if (isResponse(error)) return error;
    console.error("ERROR_SUBMIT_REVIEW_ORDER", error);
    return errorRes("Internal Server Error", 500);
  }
}
