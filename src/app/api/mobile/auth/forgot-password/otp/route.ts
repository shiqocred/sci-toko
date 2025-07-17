// resend-otp | forget-password

import {
  apiResendOTPForgotPassword,
  getResendOTPForgotPassword,
} from "@/lib/api";
import { errorRes, isAuth, signJWT, successRes } from "@/lib/auth";
import { isResponse } from "@/lib/utils";

export async function GET(req: Request) {
  try {
    const auth = await isAuth(req, "verify");

    if (!auth) throw errorRes("Unauthorized", 401);
    if (!auth.email || auth.password) throw errorRes("Unauthorized", 401);
    if (auth.sub) throw errorRes("Already logged in", 400);

    const { email } = auth;

    const response = await getResendOTPForgotPassword(email);

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

    if (!auth) return errorRes("Unauthorized", 401);
    if (!auth.email || auth.password) return errorRes("Unauthorized", 401);
    if (auth.sub) return errorRes("Already logged in", 400);

    const { email } = auth;

    const emailExits = await apiResendOTPForgotPassword(email);

    const token = signJWT({ email: emailExits }, { expiresIn: "15m" });

    return successRes({ token }, "OTP Successfully sended");
  } catch (error) {
    if (isResponse(error)) return error;

    console.error("ERROR_RESEND_OTP", error);
    return errorRes("Internal Error", 500);
  }
}
