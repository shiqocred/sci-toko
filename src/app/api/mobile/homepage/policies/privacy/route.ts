import { getPolicies } from "@/lib/api";
import { errorRes, successRes } from "@/lib/auth";
import { isResponse } from "@/lib/utils";

export async function GET() {
  try {
    const { privacy: response } = await getPolicies();

    return successRes(response, "Retrieve policy privacy");
  } catch (error) {
    if (isResponse(error)) return error;
    console.error("ERROR_GET_POLICY_PRIVACY:", error);
    return errorRes("Internal Server Error", 500);
  }
}
