import { errorRes } from "@/lib/auth";
import { convertToWebP } from "@/lib/convert-image";
import { db, userRoleDetails } from "@/lib/db";
import { uploadToR2 } from "@/lib/providers";
import { eq, sql } from "drizzle-orm";
import { NextRequest } from "next/server";
import { z } from "zod/v4";

const upgradeRolePetshop = z.object({
  nik: z.string().min(16, "Invalid NIK number"),
  full_name: z.string().min(1, "full name is required"),
});

/**
 *
 * @FormData full_name, nik, ktp, storefront
 */
export const apiUpgradeToPetShop = async (req: NextRequest, userId: string) => {
  const formData = await req.formData();

  const body = {
    full_name: formData.get("full_name") as string,
    nik: formData.get("nik") as string,
  };

  const result = upgradeRolePetshop.safeParse(body);

  if (!result.success) {
    const errors: Record<string, string> = {};

    result.error.issues.forEach((err) => {
      const path = err.path.join(".");
      errors[path] = err.message;
    });

    throw errorRes("Validation failed", 400, errors);
  }

  const { nik, full_name } = result.data;
  const ktp = formData.get("ktp") as File;
  const storefront = formData.get("storefront") as File;

  const baseKey = `images/roles/petshop/${userId}`;

  // upload ktp
  const webpBufferKTP = await convertToWebP(ktp);

  const keyKTP = `${baseKey}/ktp-${new Date().getTime()}.webp`;

  const r2UpKTP = await uploadToR2({ buffer: webpBufferKTP, key: keyKTP });

  if (!r2UpKTP) throw errorRes("Upload Failed", 400, r2UpKTP);

  // upload storefront
  const webpBufferStorefront = await convertToWebP(storefront);

  const keyStorefront = `${baseKey}/storefront-${new Date().getTime()}.webp`;

  const r2UpStorefront = await uploadToR2({
    buffer: webpBufferStorefront,
    key: keyStorefront,
  });

  if (!r2UpStorefront) throw errorRes("Upload Failed", 400, r2UpStorefront);

  const [role] = await db
    .update(userRoleDetails)
    .set({
      userId,
      name: full_name,
      nik,
      newRole: "PETSHOP",
      status: "PENDING",
      fileKtp: keyKTP,
      storefront: keyStorefront,
      updatedAt: sql`NOW()`,
    })
    .where(eq(userRoleDetails.userId, userId))
    .returning({
      newRole: userRoleDetails.newRole,
      status: userRoleDetails.status,
    });

  const response = {
    id: userId,
    new_role: role.newRole,
    status_role: role.status,
  };

  return response;
};
