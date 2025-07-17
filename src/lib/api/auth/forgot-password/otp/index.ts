import ResetPassword from "@/components/email/reset-password";
import { errorRes, generateOtp, successRes } from "@/lib/auth";
import { db, users, verificationOtp } from "@/lib/db";
import { resend } from "@/lib/providers";
import { add } from "date-fns";
import { desc, eq } from "drizzle-orm";

export const getResendOTPForgotPassword = async (email: string) => {
  const otp = await db.query.verificationOtp.findFirst({
    where: (u, { eq, and }) =>
      and(eq(u.identifier, email), eq(u.type, "PASSWORD_RESET")),
    orderBy: desc(verificationOtp.createdAt),
  });

  if (!otp) return successRes({ resend: null }, "Verification OTP");

  const { expires, createdAt } = otp;

  const isExpired = new Date() > expires;

  if (isExpired) return successRes({ resend: null }, "Verification OTP");

  const resendAgain = add(createdAt ?? new Date(), { minutes: 1 });

  return successRes({ resend: resendAgain }, "Verification OTP");
};

export const apiResendOTPForgotPassword = async (email: string) => {
  const [userExists] = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
    })
    .from(users)
    .where(eq(users.email, email))
    .orderBy(desc(users.createdAt))
    .limit(1);

  // handle error user
  if (!userExists.email || !userExists?.name)
    throw errorRes("Email not found", 404, { email: "Email not found" });

  const otp = generateOtp();
  const expires = add(new Date(), { minutes: 15 });

  Promise.all([
    db
      .delete(verificationOtp)
      .where(eq(verificationOtp.identifier, userExists.email)),
    db.insert(verificationOtp).values({
      identifier: userExists.email,
      otp,
      type: "PASSWORD_RESET",
      expires,
    }),
    resend.emails.send({
      from: "SCI Team<ju@support.sro.my.id>",
      to: [email],
      subject: "Reset password",
      react: ResetPassword({
        name: userExists.name,
        code: otp,
      }),
    }),
  ]);

  return userExists.email;
};
