// verify-otp | verification-email

import { apiVerifycationEmail } from "@/lib/api";
import { isAuth, errorRes, signJWT, successRes } from "@/lib/auth";
import { isResponse } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    const auth = await isAuth(req, "verify");

    if (!auth) throw errorRes("Unauthorized", 401);
    if (!auth.email || auth.password) throw errorRes("Unauthorized", 401);

    if (auth.sub) throw errorRes("Already logged in", 400);

    const { email } = auth;

    const user = await apiVerifycationEmail(req, email);

    const jwt = signJWT({ sub: user.id }, { expiresIn: "7d" });

    return successRes({ token: jwt }, "Email verified successfully");
  } catch (error) {
    if (isResponse(error)) return error;

    console.error("ERROR_VERIFY_EMAIL", error);
    return errorRes("Internal Error", 500);
  }
}
