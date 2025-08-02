import { productFilter } from "@/lib/api";
import { errorRes, successRes } from "@/lib/auth";

export async function GET() {
  try {
    const response = await productFilter();

    return successRes(response, "Select filter data");
  } catch (error) {
    console.log("ERROR_GET_SELECT_FILTER", error);
    return errorRes("Internal Error", 500);
  }
}
