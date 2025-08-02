import { hompage } from "@/lib/api/homepage";
import { errorRes, successRes } from "@/lib/auth";

export async function GET() {
  try {
    const response = await hompage();

    return successRes(response, "Homepage data");
  } catch (error) {
    console.log("ERROR_GET_HOMEPAGE", error);
    return errorRes("Internal Error", 500);
  }
}
