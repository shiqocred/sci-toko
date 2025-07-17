// Resend OTP | verification-email

import { getResendOTP, apiResendOTPVerificationEmail } from "@/lib/api";
import { errorRes, successRes, auth } from "@/lib/auth";
import { isResponse } from "@/lib/utils";

export async function GET() {
  try {
    const isAuth = await auth();

    if (!isAuth) throw errorRes("Unauthorized", 401);

    const { email } = isAuth.user;

    if (!email) throw errorRes("Unauthorized", 401);

    const response = await getResendOTP(email);

    return response;
  } catch (error) {
    if (isResponse(error)) return error;

    console.error("ERROR_GET_RESEND_OTP", error);
    return errorRes("Internal Error", 500);
  }
}

export async function POST() {
  try {
    const isAuth = await auth();

    if (!isAuth) throw errorRes("Unauthorized", 401);

    const { email } = isAuth.user;

    if (!email) throw errorRes("Unauthorized", 401);

    await apiResendOTPVerificationEmail(email);

    return successRes(null, "OTP Successfully sended");
  } catch (error) {
    if (isResponse(error)) return error;

    console.error("ERROR_RESEND_OTP", error);
    return errorRes("Internal Error", 500);
  }
}
