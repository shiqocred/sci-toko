import { getPolicies } from "@/lib/api";
import { errorRes, successRes } from "@/lib/auth";
import { isResponse } from "@/lib/utils";

export async function GET() {
  try {
    const { term: response } = await getPolicies();

    return successRes(response, "Retrieve term of use");
  } catch (error) {
    if (isResponse(error)) return error;
    console.error("ERROR_GET_TERM_OF_USE:", error);
    return errorRes("Internal Server Error", 500);
  }
}
