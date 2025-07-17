import { errorRes, successRes } from "@/lib/auth";
import { NextRequest } from "next/server";
import { z } from "zod/v4";
import { apiResetPassword } from "@/lib/api";
import { isResponse } from "@/lib/utils";
import { verify } from "jsonwebtoken";
import { jwtSecret } from "@/config";

const registerSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirm_password: z.string().min(1, "Confirm password is required"),
  token: z.string().min(1, "Token is required"),
});

export async function POST(req: NextRequest) {
  try {
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

    const { password, confirm_password, token } = result.data;

    const payload: { password: string } | null = verify(token, jwtSecret) as {
      password: string;
    };

    if (!payload || !payload.password) throw errorRes("Unauthorized", 401);

    const { password: userId } = payload;

    const user = await apiResetPassword(userId, password, confirm_password);

    return successRes({ userId: user.id }, "Password successfully reseted");
  } catch (error) {
    if (isResponse(error)) return error;

    console.error("ERROR_RESET_PASSWORD", error);
    return errorRes("Internal Error", 500);
  }
}
