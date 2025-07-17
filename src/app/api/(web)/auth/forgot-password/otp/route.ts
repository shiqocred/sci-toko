// resend-otp | forget-password

import {
  apiResendOTPForgotPassword,
  getResendOTPForgotPassword,
} from "@/lib/api";
import { errorRes, signJWT, successRes } from "@/lib/auth";
import { isResponse } from "@/lib/utils";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const emailData = req.nextUrl.searchParams.get("email") ?? "";

    const email = decodeURIComponent(emailData);

    if (!email) throw errorRes("Email not found", 401);

    const response = await getResendOTPForgotPassword(email);

    return response;
  } catch (error) {
    if (isResponse(error)) return error;

    console.error("ERROR_GET_RESEND_OTP", error);
    return errorRes("Internal Error", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) throw errorRes("Email not found", 401);

    const emailExits = await apiResendOTPForgotPassword(email);

    const token = signJWT({ email: emailExits }, { expiresIn: "15m" });

    return successRes({ token }, "OTP Successfully sended");
  } catch (error) {
    if (isResponse(error)) return error;

    console.error("ERROR_RESEND_OTP", error);
    return errorRes("Internal Error", 500);
  }
}
