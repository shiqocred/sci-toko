// verify-otp | forget-password

import { apiVerifyForgotPassword } from "@/lib/api";
import { errorRes, signJWT, successRes } from "@/lib/auth";
import { isResponse } from "@/lib/utils";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) throw errorRes("Email or code is required", 401);

    const userId = await apiVerifyForgotPassword(otp, email);

    const token = signJWT({ password: userId }, { expiresIn: "15m" });

    return successRes({ token }, "OTP Successfully verified");
  } catch (error) {
    if (isResponse(error)) return error;

    console.error("ERROR_VERIFY_OTP", error);
    return errorRes("Internal Error", 500);
  }
}
