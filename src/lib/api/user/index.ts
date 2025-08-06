import { r2Public } from "@/config";
import { errorRes } from "@/lib/auth";
import { convertToWebP } from "@/lib/convert-image";
import { db, users } from "@/lib/db";
import { uploadToR2 } from "@/lib/providers";
import { eq, sql } from "drizzle-orm";
import { NextRequest } from "next/server";
import { z } from "zod/v4";

const userSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z.email("Invalid email address").min(1, "Email is required"),
  phone: z.string().min(1, { message: "Phone number is required" }),
});

export const updateUser = async (req: NextRequest, userId: string) => {
  const formData = await req.formData();

  const body = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    phone: formData.get("phone") as string,
  };

  const result = userSchema.safeParse(body);

  if (!result.success) {
    const errors: Record<string, string> = {};

    result.error.issues.forEach((err) => {
      const path = err.path.join(".");
      errors[path] = err.message;
    });

    throw errorRes("Validation failed", 422, errors);
  }

  const { email, name, phone } = result.data;

  const image = formData.get("image") as File | null;
  const imageOld = formData.get("imageOld") as string | null;

  const userExist = await db.query.users.findFirst({
    columns: {
      image: true,
      email: true,
      name: true,
      phoneNumber: true,
      emailVerified: true,
    },
    where: (u, { eq }) => eq(u.id, userId),
  });

  if (!userExist) throw errorRes("Unauthorized", 401);

  let imageKey: string;

  if (image) {
    // upload KTP
    const webpBufferKtp = await convertToWebP(image);

    imageKey = `images/user/${userId}.webp`;

    const r2Upload = await uploadToR2({
      buffer: webpBufferKtp,
      key: imageKey,
    });

    if (!r2Upload) throw errorRes("Upload Failed", 422, r2Upload);
  }

  const imageOldFormatted = imageOld
    ? imageOld.replace(`${r2Public}/`, "")
    : "";

  const imageSanitize = () => {
    if (imageKey) {
      return imageKey;
    } else if (imageOldFormatted === userExist.image) {
      return userExist.image;
    } else {
      return null;
    }
  };
  const [user] = await db
    .update(users)
    .set({
      name,
      email,
      emailVerified: userExist.email !== email ? null : userExist.emailVerified,
      phoneNumber: phone,
      image: imageSanitize(),
      updatedAt: sql`NOW()`,
    })
    .where(eq(users.id, userId))
    .returning({
      name: users.name,
      email: users.email,
      emailVerified: users.emailVerified,
      phoneNumber: users.phoneNumber,
      image: users.image,
    });

  const userFormatted = {
    ...user,
    image: user.image ? `${r2Public}/${user.image}` : null,
  };

  return userFormatted;
};
