import { getPolicies } from "@/lib/api";
import { errorRes, successRes } from "@/lib/auth";
import { isResponse } from "@/lib/utils";

export async function GET() {
  try {
    const { refund: response } = await getPolicies();

    return successRes(response, "Retrieve refund policy");
  } catch (error) {
    if (isResponse(error)) return error;
    console.error("ERROR_GET_REFUND_POLICY:", error);
    return errorRes("Internal Server Error", 500);
  }
}
