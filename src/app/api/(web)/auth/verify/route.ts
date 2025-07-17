// verify-otp | verification-email

import { apiVerifycationEmail } from "@/lib/api";
import { errorRes, successRes, auth } from "@/lib/auth";
import { isResponse } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    const isAuth = await auth();

    if (!isAuth) throw errorRes("Unauthorized", 401);

    const { email } = isAuth.user;

    if (!email) throw errorRes("Unauthorized", 401);

    const user = await apiVerifycationEmail(req, email);

    return successRes(
      { emailVerified: user.emailVerified },
      "Email verified successfully"
    );
  } catch (error) {
    if (isResponse(error)) return error;

    console.error("ERROR_VERIFY_EMAIL", error);
    return errorRes("Internal Error", 500);
  }
}
