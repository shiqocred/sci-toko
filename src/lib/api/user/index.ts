import { r2Public } from "@/config";
import { errorRes } from "@/lib/auth";
import { convertToWebP } from "@/lib/convert-image";
import { db, userRoleDetails, users } from "@/lib/db";
import { deleteR2, uploadToR2 } from "@/lib/providers";
import { and, eq, isNull, sql } from "drizzle-orm";
import { NextRequest } from "next/server";
import { z } from "zod/v4";

const userSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z.email("Invalid email address").min(1, "Email is required"),
  phone: z.string().min(1, { message: "Phone number is required" }),
});

export const getUser = async (userId: string) => {
  const [userRes] = await db
    .select({
      email: users.email,
      emailVerified: users.emailVerified,
      image: users.image,
      name: users.name,
      phoneNumber: users.phoneNumber,
      role: users.role,
      newRole: userRoleDetails.newRole,
      statusRole: userRoleDetails.status,
    })
    .from(users)
    .innerJoin(userRoleDetails, eq(userRoleDetails.userId, userId))
    .where(and(eq(users.id, userId), isNull(users.deletedAt)))
    .limit(1);

  if (!userRes) throw errorRes("User not found", 404);

  const response = {
    ...userRes,
    image: userRes.image ? `${r2Public}/${userRes.image}` : null,
  };

  return response;
};

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
    where: (u, { eq, and, isNull }) =>
      and(eq(u.id, userId), isNull(u.deletedAt)),
  });

  if (!userExist) throw errorRes("Unauthorized", 401);

  let imageKey: string = "";

  const imageOldFormatted = imageOld
    ? imageOld.replace(`${r2Public}/`, "")
    : "";

  if (image) {
    // upload KTP
    const webpBufferKtp = await convertToWebP(image);

    imageKey = `images/user/${userId}-${new Date().getTime()}.webp`;

    if (userExist.image) {
      await deleteR2(imageOldFormatted);
    }

    const r2Upload = await uploadToR2({
      buffer: webpBufferKtp,
      key: imageKey,
    });

    if (!r2Upload) throw errorRes("Upload Failed", 422, r2Upload);
  }

  const imageSanitize = async () => {
    if (imageKey) {
      return imageKey;
    } else if (!imageKey && !userExist.image) {
      return null;
    } else {
      return userExist.image;
    }
  };

  const [user] = await db
    .update(users)
    .set({
      name,
      email,
      emailVerified: userExist.email !== email ? null : userExist.emailVerified,
      phoneNumber: phone,
      image: await imageSanitize(),
      updatedAt: sql`NOW()`,
    })
    .where(and(eq(users.id, userId), isNull(users.deletedAt)))
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

export const deleteUser = async (req: NextRequest, userId: string) => {
  const email = req.nextUrl.searchParams.get("email");

  if (!email) throw errorRes("Email is required", 400);
  const decodeEmail = decodeURIComponent(email);

  const userExist = await db.query.users.findFirst({
    where: (u, { eq, and, isNull }) =>
      and(eq(u.id, userId), isNull(u.deletedAt)),
  });

  if (!userExist) throw errorRes("User not match", 404);
  if (userExist.email !== decodeEmail) throw errorRes("User not match", 404);

  await db
    .update(users)
    .set({
      deletedAt: sql`NOW()`,
      updatedAt: sql`NOW()`,
      email: `deleted_${userExist.email}`,
    })
    .where(and(eq(users.id, userId), isNull(users.deletedAt)));

  return "Account deleted successfully";
};
