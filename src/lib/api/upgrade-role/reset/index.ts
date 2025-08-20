import { errorRes } from "@/lib/auth";
import { db, userRoleDetails } from "@/lib/db";
import { deleteR2 } from "@/lib/providers";
import { eq, sql } from "drizzle-orm";

export const apiResetUpgradeRole = async (userId: string) => {
  const userDetailExist = await db.query.userRoleDetails.findFirst({
    columns: {
      role: true,
      veterinarianIdFile: true,
      personalIdFile: true,
      storefrontFile: true,
    },
    where: (u, { eq }) => eq(u.userId, userId),
  });

  if (!userDetailExist) throw errorRes("User not match", 404);

  await db
    .update(userRoleDetails)
    .set({
      updatedAt: sql`NOW()`,
      veterinarianIdFile: null,
      personalIdFile: null,
      message: null,
      fullName: null,
      newRole: userDetailExist.role,
      personalIdType: null,
      personalId: null,
      veterinarianId: null,
      status: null,
      storefrontFile: null,
    })
    .where(eq(userRoleDetails.userId, userId));

  if (userDetailExist.veterinarianIdFile)
    await deleteR2(userDetailExist.veterinarianIdFile);
  if (userDetailExist.personalIdFile)
    await deleteR2(userDetailExist.personalIdFile);
  if (userDetailExist.storefrontFile)
    await deleteR2(userDetailExist.storefrontFile);
};
