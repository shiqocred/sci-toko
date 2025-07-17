import { errorRes } from "@/lib/auth";
import { db, userRoleDetails } from "@/lib/db";
import { deleteR2 } from "@/lib/providers";
import { eq, sql } from "drizzle-orm";

export const apiResetUpgradeRole = async (userId: string) => {
  const userDetailExist = await db.query.userRoleDetails.findFirst({
    columns: {
      role: true,
      fileKta: true,
      fileKtp: true,
      storefront: true,
    },
    where: (u, { eq }) => eq(u.userId, userId),
  });

  if (!userDetailExist) throw errorRes("User not match", 404);

  await db
    .update(userRoleDetails)
    .set({
      updatedAt: sql`NOW()`,
      fileKta: null,
      fileKtp: null,
      message: null,
      name: null,
      newRole: userDetailExist.role,
      nik: null,
      noKta: null,
      status: null,
      storefront: null,
    })
    .where(eq(userRoleDetails.userId, userId));

  if (userDetailExist.fileKta) await deleteR2(userDetailExist.fileKta);
  if (userDetailExist.fileKtp) await deleteR2(userDetailExist.fileKtp);
  if (userDetailExist.storefront) await deleteR2(userDetailExist.storefront);
};
