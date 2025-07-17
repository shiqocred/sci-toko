import { errorRes } from "@/lib/auth";
import { db, verificationOtp } from "@/lib/db";
import { and, eq } from "drizzle-orm";

export const apiVerifyForgotPassword = async (otp: string, email: string) => {
  // ada users ga
  const userExists = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.email, email),
  });

  // handle error user
  if (!userExists?.id || !userExists?.email || !userExists?.name)
    throw errorRes("Unauthorized", 401);

  // cek token sama email sama ga
  const tokenEntry = await db.query.verificationOtp.findFirst({
    where: and(
      eq(verificationOtp.identifier, email),
      eq(verificationOtp.otp, otp)
    ),
  });

  // handle error not match
  if (!tokenEntry || tokenEntry.expires < new Date())
    throw errorRes("Invalid or expired token", 400);

  await db
    .delete(verificationOtp)
    .where(
      and(eq(verificationOtp.identifier, email), eq(verificationOtp.otp, otp))
    );

  return userExists.id;
};
