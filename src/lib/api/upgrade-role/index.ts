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
      },
      where: (u, { eq, and }) =>
        and(eq(u.userId, userId), eq(u.newRole, "PETSHOP")),
    });

    if (!userExist)
      return successRes(
        { status: null, role: user.role, message: null },
        "Application status"
      );

    return successRes(userExist, "Application status");
  }

  const userExist = await db.query.userRoleDetails.findFirst({
    columns: {
      status: true,
      role: true,
      message: true,
    },
    where: (u, { eq, and }) =>
      and(eq(u.userId, userId), eq(u.newRole, "VETERINARIAN")),
  });

  if (!userExist)
    return successRes(
      { status: null, role: user.role, message: null },
      "Application status"
    );

  return successRes(userExist, "Application status");
};
