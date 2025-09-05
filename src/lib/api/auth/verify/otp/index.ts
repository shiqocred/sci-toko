import { eq } from "drizzle-orm";
import { add } from "date-fns";
import { VerifyEmail } from "@/components/email/verify";
import { db, verificationOtp } from "@/lib/db";
import { errorRes, generateOtp } from "@/lib/auth";
import { transporter } from "@/lib/providers";
import { smtpUser } from "@/config";

export const apiResendOTPVerificationEmail = async (email: string) => {
  const userExists = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.email, email),
  });

  if (!userExists?.id || !userExists?.email || !userExists?.name)
    throw errorRes("Unauthorized", 401);

  if (userExists.emailVerified) throw errorRes("Email have been verified", 400);

  const otp = generateOtp();
  const expires = add(new Date(), { minutes: 15 });

  Promise.all([
    await db
      .delete(verificationOtp)
      .where(eq(verificationOtp.identifier, userExists.email)),

    db.insert(verificationOtp).values({
      identifier: userExists.email,
      otp,
      type: "EMAIL_VERIFICATION",
      expires,
    }),

    transporter.sendMail({
      from: `Sehat Cerah Indonesia<${smtpUser}>`,
      to: [email],
      subject: "Verify your email",
      html: await VerifyEmail({
        name: userExists.name,
        code: otp,
      }),
    }),
  ]);
};
