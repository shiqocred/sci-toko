import { errorRes } from "@/lib/auth";
import { db, users } from "@/lib/db";
import { hash } from "argon2";
import { and, eq, isNull } from "drizzle-orm";

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
          password: `Password ${
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
      ? { confirm_password: "Passwords do not match" }
      : null;

  return result;
};

export const apiResetPassword = async (
  userId: string,
  password: string,
  confirm_password: string
) => {
  const { failed, passwordError } = await validationPassword(password);
  const passwordMatch = validationConfirmPassword(password, confirm_password);

  if (password.length < 8 || failed.length > 0 || passwordMatch)
    throw errorRes("Validation failed", 400, {
      ...passwordError,
      ...passwordMatch,
    });

  const [user] = await db
    .update(users)
    .set({ password: await hash(password) })
    .where(and(eq(users.id, userId), isNull(users.deletedAt)))
    .returning({ id: users.id });

  return user;
};
