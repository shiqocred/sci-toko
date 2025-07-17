// verify-otp | forget-password

import { apiVerifyForgotPassword } from "@/lib/api";
import { errorRes, isAuth, signJWT, successRes } from "@/lib/auth";
import { isResponse } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    const auth = await isAuth(req, "verify");

    if (!auth) throw errorRes("Unauthorized", 401);
    if (!auth.email || auth.password) throw errorRes("Unauthorized", 401);
    if (auth.sub) throw errorRes("Already logged in", 400);

    const { email } = auth;

    // ada json otp ga
    const { otp } = await req.json();

    // handle error otp
    if (!otp) throw errorRes("Missing OTP code", 400);

    const userId = await apiVerifyForgotPassword(otp, email);

    const token = signJWT({ password: userId }, { expiresIn: "1d" });

    return successRes({ token }, "OTP Successfully verified");
  } catch (error) {
    if (isResponse(error)) return error;

    console.error("ERROR_VERIFY_OTP", error);
    return errorRes("Internal Error", 500);
  }
}
