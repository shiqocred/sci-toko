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
    where: (u, { eq, and, isNull }) =>
      and(eq(u.id, userId), isNull(u.deletedAt)),
  });

  if (!user) throw errorRes("user not match", 404);

  if (role === "petshop") {
    const userExist = await db.query.userRoleDetails.findFirst({
      columns: {
        status: true,
        role: true,
        message: true,
        fullName: true,
        personalIdType: true,
        personalId: true,
        personalIdFile: true,
        storefrontFile: true,
      },
      where: (u, { eq, and }) =>
        and(eq(u.userId, userId), eq(u.newRole, "PETSHOP")),
    });

    if (!userExist)
      return successRes(
        {
          personalIdFile: null,
          storefrontFile: null,
          role: user.role,
          status: null,
          message: null,
          personalIdType: null,
          personalId: null,
          fullName: null,
        },
        "Application status"
      );

    const response = {
      ...userExist,
      personalIdFile: userExist.personalIdFile
        ? `${r2Public}/${userExist.personalIdFile}`
        : null,
      storefrontFile: userExist.storefrontFile
        ? `${r2Public}/${userExist.storefrontFile}`
        : null,
    };

    return successRes(response, "Application status");
  }

  const userExist = await db.query.userRoleDetails.findFirst({
    columns: {
      status: true,
      role: true,
      message: true,
      fullName: true,
      personalId: true,
      personalIdFile: true,
      veterinarianId: true,
      veterinarianIdFile: true,
    },
    where: (u, { eq, and }) =>
      and(eq(u.userId, userId), eq(u.newRole, "VETERINARIAN")),
  });

  if (!userExist)
    return successRes(
      {
        role: user.role,
        personalId: null,
        personalIdFile: null,
        veterinarianId: null,
        veterinarianIdFile: null,
        fullName: null,
        message: null,
        status: null,
      },
      "Application status"
    );

  const response = {
    ...userExist,
    personalIdFile: userExist.personalIdFile
      ? `${r2Public}/${userExist.personalIdFile}`
      : null,
    veterinarianIdFile: userExist.veterinarianIdFile
      ? `${r2Public}/${userExist.veterinarianIdFile}`
      : null,
  };

  return successRes(response, "Application status");
};
