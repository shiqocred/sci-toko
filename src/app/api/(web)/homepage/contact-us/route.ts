import { getContact } from "@/lib/api";
import { errorRes, successRes } from "@/lib/auth";
import { isResponse } from "@/lib/utils";

export async function GET() {
  try {
    const response = await getContact();

    return successRes(response, "Retrieve contact");
  } catch (error) {
    if (isResponse(error)) return error;
    console.error("ERROR_GET_CONTACT:", error);
    return errorRes("Internal Server Error", 500);
  }
}
