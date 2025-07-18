import { r2Public } from "@/config";
import { errorRes, successRes } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextRequest } from "next/server";

export const apiGetStatusRole = async (req: NextRequest, userId: string) => {
  const role = req.nextUrl.searchParams.get("role") ?? "";

  if (role !== "petshop" && role !== "veterinarian")
    throw errorRes("role query must be petshop or veterinarian", 422);

  const user = await db.query.users.findFirst({
    columns: {
      role: true,
    },
    where: (u, { eq }) => eq(u.id, userId),
  });

  if (!user) throw errorRes("user not match", 404);

  if (role === "petshop") {
    const userExist = await db.query.userRoleDetails.findFirst({
      columns: {
        status: true,
        role: true,
        message: true,
        fileKtp: true,
        name: true,
        nik: true,
        storefront: true,
      },
      where: (u, { eq, and }) =>
        and(eq(u.userId, userId), eq(u.newRole, "PETSHOP")),
    });

    if (!userExist)
      return successRes(
        {
          status: null,
          role: user.role,
          message: null,
          fileKtp: null,
          storefront: null,
          name: null,
          nik: null,
        },
        "Application status"
      );

    const response = {
      ...userExist,
      fileKtp: userExist.fileKtp ? `${r2Public}/${userExist.fileKtp}` : null,
      storefront: userExist.storefront
        ? `${r2Public}/${userExist.storefront}`
        : null,
    };

    return successRes(response, "Application status");
  }

  const userExist = await db.query.userRoleDetails.findFirst({
    columns: {
      status: true,
      role: true,
      message: true,
      fileKtp: true,
      fileKta: true,
      name: true,
      nik: true,
      noKta: true,
    },
    where: (u, { eq, and }) =>
      and(eq(u.userId, userId), eq(u.newRole, "VETERINARIAN")),
  });

  if (!userExist)
    return successRes(
      {
        status: null,
        role: user.role,
        message: null,
        fileKtp: null,
        fileKta: null,
        name: null,
        nik: null,
        noKta: null,
      },
      "Application status"
    );

  const response = {
    ...userExist,
    fileKtp: userExist.fileKtp ? `${r2Public}/${userExist.fileKtp}` : null,
    fileKta: userExist.fileKta ? `${r2Public}/${userExist.fileKta}` : null,
  };

  return successRes(response, "Application status");
};
