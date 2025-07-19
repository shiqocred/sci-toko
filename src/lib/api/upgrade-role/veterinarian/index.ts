import { errorRes } from "@/lib/auth";
import { convertToWebP } from "@/lib/convert-image";
import { db, userRoleDetails } from "@/lib/db";
import { uploadToR2 } from "@/lib/providers";
import { eq, sql } from "drizzle-orm";
import { NextRequest } from "next/server";
import { z } from "zod/v4";

const upgradeRoleVeterinarian = z.object({
  nik: z.string().min(16, "Invalid NIK number"),
  no_kta: z.string().min(1, "KTA number is required"),
  full_name: z.string().min(1, "full name is required"),
  ktp: z
    .custom<File>((val) => val instanceof File, {
      message: "File is required",
    })
    .refine((file) => file.size > 0, {
      message: "File is empty",
    })
    .refine((file) => file.type.startsWith("image/"), {
      message: "Only image files are allowed",
    }),
  kta: z
    .custom<File>((val) => val instanceof File, {
      message: "File is required",
    })
    .refine((file) => file.size > 0, {
      message: "File is empty",
    })
    .refine((file) => file.type.startsWith("image/"), {
      message: "Only image files are allowed",
    }),
});

/**
 *
 * @FormData full_name, nik, ktp, no_kta, kta
 */
export const apiUpgradeToVeterinarian = async (
  req: NextRequest,
  userId: string
) => {
  const formData = await req.formData();

  const body = {
    full_name: formData.get("full_name") as string,
    nik: formData.get("nik") as string,
    no_kta: formData.get("no_kta") as string,
    ktp: formData.get("ktp") as File,
    kta: formData.get("kta") as File,
  };

  const result = upgradeRoleVeterinarian.safeParse(body);

  if (!result.success) {
    const errors: Record<string, string> = {};

    result.error.issues.forEach((err) => {
      const path = err.path.join(".");
      errors[path] = err.message;
    });

    throw errorRes("Validation failed", 422, errors);
  }

  const { nik, no_kta, full_name, ktp, kta } = result.data;

  const baseKey = `images/roles/veterinarian/${userId}`;

  // upload KTP
  const webpBufferKtp = await convertToWebP(ktp);

  const keyKtp = `${baseKey}/ktp.webp`;

  const r2UpKtp = await uploadToR2({ buffer: webpBufferKtp, key: keyKtp });

  if (!r2UpKtp) throw errorRes("Upload Failed", 422, r2UpKtp);

  // upload KTP
  const webpBufferKta = await convertToWebP(kta);

  const keyKta = `${baseKey}/kta.webp`;

  const r2UpKta = await uploadToR2({ buffer: webpBufferKta, key: keyKta });

  if (!r2UpKta) throw errorRes("Upload Failed", 422, r2UpKta);

  const [role] = await db
    .update(userRoleDetails)
    .set({
      userId,
      name: full_name,
      nik,
      noKta: no_kta,
      newRole: "VETERINARIAN",
      status: "PENDING",
      fileKtp: keyKtp,
      fileKta: keyKta,
      updatedAt: sql`NOW()`,
    })
    .where(eq(userRoleDetails.userId, userId))
    .returning({
      newRole: userRoleDetails.newRole,
      status: userRoleDetails.status,
    });

  const response = {
    id: userId,
    newRole: role.newRole,
    status_role: role.status,
  };

  return response;
};
