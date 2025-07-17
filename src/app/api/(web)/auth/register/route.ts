import { errorRes, successRes } from "@/lib/auth";
import { apiRegister } from "@/lib/api";
import { isResponse } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    const user = await apiRegister(req);

    return successRes(user, "Register successfully");
  } catch (error) {
    if (isResponse(error)) return error;

    console.log("ERROR_REGISTER", error);
    return errorRes("Internal Error", 500);
  }
}
