import { errorRes } from "@/lib/auth";
import { db, users } from "@/lib/db";
import { hash, verify } from "argon2";
import { eq, sql } from "drizzle-orm";
import { NextRequest } from "next/server";
import { z } from "zod/v4";

const registerSchema = z.object({
  old_password: z.string().min(1, "Old password is required"),
  new_password: z.string().min(8, "New password must be at least 8 characters"),
  confirm_new_password: z.string().min(1, "Confirm new password is required"),
});

const validationPassword = async (value: string) => {
  const failed = [
    { regex: /[A-Z]/, label: "one uppercase letter" },
    { regex: /[a-z]/, label: "one lowercase letter" },
    { regex: /\d/, label: "one number" },
    { regex: /[!@#$%^&*()[\]{}:;<>,.?/~_+=|\\-]/, label: "one symbol" },
  ].reduce((acc, rule) => {
    if (!rule.regex.test(value)) acc.push(rule.label);
    return acc;
  }, [] as string[]);
  const passwordError =
    value.length < 8 || failed.length > 0
      ? {
          new_password: `Password ${
            value.length < 8 ? "must be at least 8 characters" : ""
          } ${
            failed.length > 0 && value.length < 8
              ? "and must include at least"
              : "must include at least"
          } ${
            failed.length === 1
              ? failed[0]
              : failed.length > 1 &&
                `${failed
                  .slice(0, failed.length - 1)
                  .map((item) => item)} and ${failed[failed.length - 1]}`
          }`,
        }
      : null;

  return { failed, passwordError };
};

const validationConfirmPassword = (password: string, confirm: string) => {
  const result =
    password !== confirm
      ? { confirm_new_password: "Passwords do not match" }
      : null;

  return result;
};

export const updatePassword = async (req: NextRequest, userId: string) => {
  const body = await req.json();
  const result = registerSchema.safeParse(body);

  if (!result.success) {
    const errors: Record<string, string> = {};

    result.error.issues.forEach((err) => {
      const path = err.path.join(".");
      errors[path] = err.message;
    });

    return errorRes("Validation failed", 422, errors);
  }

  const { old_password, new_password, confirm_new_password } = result.data;

  const userExist = await db.query.users.findFirst({
    columns: {
      password: true,
    },
    where: (u, { eq }) => eq(u.id, userId),
  });

  if (!userExist) return errorRes("Unauthorized", 401);
  if (!userExist.password) return errorRes("Unauthorized", 401);

  const isPasswordMatch = await verify(userExist.password, old_password);

  if (!isPasswordMatch) return errorRes("Unauthorized", 401);

  const { failed, passwordError } = await validationPassword(new_password);

  const passwordMatch = validationConfirmPassword(
    new_password,
    confirm_new_password
  );

  if (failed.length > 0 || passwordMatch)
    return errorRes("Validation failed", 422, {
      ...passwordError,
      ...passwordMatch,
    });

  await db
    .update(users)
    .set({
      password: await hash(new_password),
      updatedAt: sql`NOW()`,
    })
    .where(eq(users.id, userId));
};
