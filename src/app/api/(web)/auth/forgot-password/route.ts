// send-otp | forget-password

import { apiForgotPassword } from "@/lib/api";
import { errorRes, successRes } from "@/lib/auth";
import { isResponse } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    const email = await apiForgotPassword(req);

    return successRes({ email }, "OTP Successfully sended");
  } catch (error) {
    if (isResponse(error)) return error;

    console.error("ERROR_SEND_OTP", error);
    return errorRes("Internal Error", 500);
  }
}
