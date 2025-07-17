// Resend OTP | verification-email

import { getResendOTP, apiResendOTPVerificationEmail } from "@/lib/api";
import { isAuth, errorRes, successRes, signJWT } from "@/lib/auth";
import { isResponse } from "@/lib/utils";

export async function GET(req: Request) {
  try {
    const auth = await isAuth(req, "verify");

    if (!auth) throw errorRes("Unauthorized", 401);
    if (!auth.email || auth.password) throw errorRes("Unauthorized", 401);
    if (auth.sub) throw errorRes("Already logged in", 400);

    const { email } = auth;

    const response = await getResendOTP(email);

    return response;
  } catch (error) {
    if (isResponse(error)) return error;

    console.error("ERROR_GET_RESEND_OTP", error);
    return errorRes("Internal Error", 500);
  }
}

export async function POST(req: Request) {
  try {
    const auth = await isAuth(req, "verify");

    if (!auth) throw errorRes("Unauthorized", 401);
    if (!auth.email || auth.password) throw errorRes("Unauthorized", 401);
    if (auth.sub) throw errorRes("Already logged in", 400);

    const { email } = auth;

    await apiResendOTPVerificationEmail(email);

    const jwt = signJWT({ email }, { expiresIn: "15m" });

    return successRes({ token: jwt }, "OTP Successfully sended");
  } catch (error) {
    if (isResponse(error)) return error;

    console.error("ERROR_RESEND_OTP", error);
    return errorRes("Internal Error", 500);
  }
}
