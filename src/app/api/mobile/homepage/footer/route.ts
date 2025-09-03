import { getFooter } from "@/lib/api";
import { errorRes, successRes } from "@/lib/auth";
import { isResponse } from "@/lib/utils";

export async function GET() {
  try {
    const response = await getFooter();

    return successRes(response, "Retrieve footer");
  } catch (error) {
    if (isResponse(error)) return error;
    console.error("ERROR_GET_FOOTER:", error);
    return errorRes("Internal Server Error", 500);
  }
}
