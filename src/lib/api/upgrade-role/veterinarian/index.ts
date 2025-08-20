import { errorRes } from "@/lib/auth";
import { convertToWebP } from "@/lib/convert-image";
import { db, userRoleDetails } from "@/lib/db";
import { uploadToR2 } from "@/lib/providers";
import { eq, sql } from "drizzle-orm";
import { NextRequest } from "next/server";
import { z } from "zod/v4";

const upgradeRoleVeterinarian = z.object({
  personal_id: z.string().min(1, "Invalid Personal Id number"),
  veterinarian_id: z.string().min(1, "KTA number is required"),
  full_name: z.string().min(1, "full name is required"),
});

/**
 *
 * @FormData full_name, personal_id, personal_id_file, veterinarian_id, veterinarian_id_file
 */
export const apiUpgradeToVeterinarian = async (
  req: NextRequest,
  userId: string
) => {
  const formData = await req.formData();

  const body = {
    full_name: formData.get("full_name") as string,
    personal_id: formData.get("personal_id") as string,
    veterinarian_id: formData.get("veterinarian_id") as string,
  };

  const result = upgradeRoleVeterinarian.safeParse(body);
  if (!result.success) {
    const errors: Record<string, string> = {};
    result.error.issues.forEach((err) => {
      errors[err.path.join(".")] = err.message;
    });
    throw errorRes("Validation failed", 422, errors);
  }

  const { personal_id, veterinarian_id, full_name } = result.data;

  const personalIdFileReq = formData.get("personal_id_file") as File;
  const veterinarianIdFileReq = formData.get("veterinarian_id_file") as File;
  const baseKey = `images/roles/veterinarian/${userId}`;

  // Upload KTP
  const webpBufferPersonal = await convertToWebP(personalIdFileReq);
  const personalIdFile = `${baseKey}/ktp-${Date.now()}.webp`;
  const r2UpPersonal = await uploadToR2({
    buffer: webpBufferPersonal,
    key: personalIdFile,
  });
  if (!r2UpPersonal) throw errorRes("Upload Failed", 422, r2UpPersonal);

  // Upload KTA
  const webpBufferVeterinarian = await convertToWebP(veterinarianIdFileReq);
  const veterinarianIdFile = `${baseKey}/kta-${Date.now()}.webp`;
  const r2UpVeterinarian = await uploadToR2({
    buffer: webpBufferVeterinarian,
    key: veterinarianIdFile,
  });
  if (!r2UpVeterinarian) throw errorRes("Upload Failed", 422, r2UpVeterinarian);

  const [role] = await db
    .update(userRoleDetails)
    .set({
      userId,
      fullName: full_name,
      personalIdType: "NIK",
      personalId: personal_id,
      veterinarianId: veterinarian_id,
      newRole: "VETERINARIAN",
      status: "PENDING",
      personalIdFile,
      veterinarianIdFile,
      updatedAt: sql`NOW()`,
    })
    .where(eq(userRoleDetails.userId, userId))
    .returning({
      newRole: userRoleDetails.newRole,
      status: userRoleDetails.status,
    });

  return {
    id: userId,
    newRole: role.newRole,
    status_role: role.status,
  };
};
