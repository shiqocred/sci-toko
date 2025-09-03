import { getFAQs } from "@/lib/api";
import { errorRes, successRes } from "@/lib/auth";
import { isResponse } from "@/lib/utils";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get("q") ?? "";

    const response = await getFAQs(q);

    return successRes(response, "Retrieve faqs");
  } catch (error) {
    if (isResponse(error)) return error;
    console.error("ERROR_GET_FAQS:", error);
    return errorRes("Internal Server Error", 500);
  }
}
