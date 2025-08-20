import { courier } from "@/lib/api";
import { auth, errorRes, successRes } from "@/lib/auth";
import { isResponse } from "@/lib/utils";

export async function GET() {
  try {
    const session = await auth();
    if (!session) return errorRes("Unauthorized", 401);

    const userId = session.user.id;

    const { response, message } = await courier(userId);

    return successRes(response, message);
  } catch (error) {
    if (isResponse(error)) return error;
    console.error("Checkout Error", error);
    return errorRes("Internal server error", 500);
  }
}
