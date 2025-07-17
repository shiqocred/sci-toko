import { errorRes, isAuth, successRes } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextRequest } from "next/server";
import { z } from "zod/v4";
import { apiResetPassword } from "@/lib/api";
import { isResponse } from "@/lib/utils";

const registerSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirm_password: z.string().min(1, "Confirm password is required"),
});

export async function POST(req: NextRequest) {
  try {
    const auth = await isAuth(req, "verify");

    if (!auth || auth.email || !auth.password)
      throw errorRes("Unauthorized", 401);
    if (auth.sub) throw errorRes("Already logged in", 400);

    const { password: userId } = auth;

    // ada users ga
    const userExists = await db.query.users.findFirst({
      where: (u, { eq }) => eq(u.id, userId),
    });

    // handle error user
    if (!userExists?.id || !userExists?.email || !userExists?.name)
      throw errorRes("Unauthorized", 401);

    // get body
    const body = await req.json();

    // parse velidasi dan body
    const result = registerSchema.safeParse(body);

    // handle error validasi
    if (!result.success) {
      const errors: Record<string, string> = {};

      result.error.issues.forEach((err) => {
        const path = err.path.join(".");
        errors[path] = err.message;
      });

      throw errorRes("Validation failed", 400, errors);
    }

    const { password, confirm_password } = result.data;

    const user = await apiResetPassword(userId, password, confirm_password);

    return successRes({ userId: user.id }, "Password successfully reseted");
  } catch (error) {
    if (isResponse(error)) return error;

    console.error("ERROR_RESET_PASSWORD", error);
    return errorRes("Internal Error", 500);
  }
}
