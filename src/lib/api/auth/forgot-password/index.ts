import ResetPassword from "@/components/email/reset-password";
import { errorRes, generateOtp } from "@/lib/auth";
import { db, users, verificationOtp } from "@/lib/db";
import { resend } from "@/lib/providers";
import { add } from "date-fns";
import { desc, eq } from "drizzle-orm";

export const apiForgotPassword = async (req: Request) => {
  const { email } = await req.json();

  if (!email) throw errorRes("Email is required", 400);

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

  if (!userExists?.email || !userExists?.name)
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
      from: "SCI Team<inpo@support.sro.my.id>",
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
