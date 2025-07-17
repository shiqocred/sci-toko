import { and, desc, eq } from "drizzle-orm";
import { add } from "date-fns";
import { errorRes, successRes } from "@/lib/auth";
import { db, users, verificationOtp } from "@/lib/db";

export const getResendOTP = async (email: string) => {
  const otp = await db.query.verificationOtp.findFirst({
    where: (u, { eq, and }) =>
      and(eq(u.identifier, email), eq(u.type, "EMAIL_VERIFICATION")),
    orderBy: desc(verificationOtp.createdAt),
  });

  if (!otp) return successRes({ resend: null }, "Verification OTP");

  const { expires, createdAt } = otp;

  const isExpired = new Date() > expires;

  if (isExpired) return successRes({ resend: null }, "Verification OTP");

  const resendAgain = add(createdAt ?? new Date(), { minutes: 1 });

  return successRes({ resend: resendAgain }, "Verification OTP");
};

export const apiVerifycationEmail = async (req: Request, email: string) => {
  const { otp } = await req.json();

  if (!otp) {
    throw errorRes("Missing token", 400);
  }

  const tokenEntry = await db.query.verificationOtp.findFirst({
    where: and(
      eq(verificationOtp.identifier, email),
      eq(verificationOtp.otp, otp)
    ),
  });

  if (!tokenEntry) throw errorRes("Invalid or expired token", 400);

  if (tokenEntry.expires < new Date()) throw errorRes("Token has expired", 400);

  const now = new Date();
  const [user] = await db
    .update(users)
    .set({ emailVerified: now, updatedAt: now })
    .where(eq(users.email, email))
    .returning({
      id: users.id,
      emailVerified: users.emailVerified,
    });

  await db
    .delete(verificationOtp)
    .where(
      and(eq(verificationOtp.identifier, email), eq(verificationOtp.otp, otp))
    );

  return user;
};
