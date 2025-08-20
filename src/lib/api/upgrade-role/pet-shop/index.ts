import { errorRes } from "@/lib/auth";
import { convertToWebP } from "@/lib/convert-image";
import { db, userRoleDetails } from "@/lib/db";
import { uploadToR2 } from "@/lib/providers";
import { eq, sql } from "drizzle-orm";
import { NextRequest } from "next/server";
import { z } from "zod/v4";

const upgradeRolePetshop = z.object({
  personal_id: z.string().min(1, "Invalid personal id number"),
  full_name: z.string().min(1, "full name is required"),
  personal_id_type: z.enum(["NIK", "NIB", "NPWP"]),
});

/**
 *
 * @FormData full_name, personal_id_type, personal_id, personal_id_file, storefront_file
 */
export const apiUpgradeToPetShop = async (req: NextRequest, userId: string) => {
  const formData = await req.formData();

  const body = {
    full_name: formData.get("full_name") as string,
    personal_id: formData.get("personal_id") as string,
    personal_id_type: formData.get("personal_id_type") as string,
  };

  const result = upgradeRolePetshop.safeParse(body);
  if (!result.success) {
    const errors: Record<string, string> = {};
    result.error.issues.forEach((err) => {
      errors[err.path.join(".")] = err.message;
    });
    throw errorRes("Validation failed", 400, errors);
  }

  const { personal_id, personal_id_type, full_name } = result.data;
  const personalIdFileReq = formData.get("personal_id_file") as File;
  const storefrontFileReq = formData.get("storefront_file") as File;
  const baseKey = `images/roles/petshop/${userId}`;

  // Upload KTP
  const webpBufferpersonalId = await convertToWebP(personalIdFileReq);
  const personalIdFile = `${baseKey}/personal-id-${Date.now()}.webp`;
  const r2UppersonalId = await uploadToR2({
    buffer: webpBufferpersonalId,
    key: personalIdFile,
  });
  if (!r2UppersonalId) throw errorRes("Upload Failed", 400, r2UppersonalId);

  // Upload Storefront
  const webpBufferStorefront = await convertToWebP(storefrontFileReq);
  const storefrontFile = `${baseKey}/storefront-${Date.now()}.webp`;
  const r2UpStorefront = await uploadToR2({
    buffer: webpBufferStorefront,
    key: storefrontFile,
  });
  if (!r2UpStorefront) throw errorRes("Upload Failed", 400, r2UpStorefront);

  const [role] = await db
    .update(userRoleDetails)
    .set({
      userId,
      fullName: full_name,
      personalIdType: personal_id_type,
      personalId: personal_id,
      newRole: "PETSHOP",
      status: "PENDING",
      personalIdFile,
      storefrontFile,
      updatedAt: sql`NOW()`,
    })
    .where(eq(userRoleDetails.userId, userId))
    .returning({
      newRole: userRoleDetails.newRole,
      status: userRoleDetails.status,
    });

  return {
    id: userId,
    new_role: role.newRole,
    status_role: role.status,
  };
};
