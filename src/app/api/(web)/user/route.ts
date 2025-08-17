import { r2Public } from "@/config";
import { updateUser } from "@/lib/api";
import { auth, errorRes, successRes } from "@/lib/auth";
import { db, userRoleDetails, users } from "@/lib/db";
import { isResponse } from "@/lib/utils";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";

export async function GET() {
  try {
    const isAuth = await auth();

    if (!isAuth) return errorRes("Unauthorized", 401);

    const userId = isAuth.user.id;

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
      .where(eq(users.id, userId))
      .limit(1);

    if (!userRes) throw errorRes("User not found", 404);

    const response = {
      ...userRes,
      image: userRes.image ? `${r2Public}/${userRes.image}` : null,
    };

    return successRes(response, "Retrieve detail user");
  } catch (error) {
    if (isResponse(error)) return error;

    console.log("ERROR_GET_PROFILE", error);
    return errorRes("Internal Error", 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const isAuth = await auth();

    if (!isAuth) return errorRes("Unauthorized", 401);
    if (!isAuth.user.emailVerified) return errorRes("Email not verified", 422);

    const userId = isAuth.user.id;

    const response = await updateUser(req, userId);

    return successRes(response, "User successfully updated");
  } catch (error) {
    if (isResponse(error)) return error;

    console.log("ERROR_UPDATE_PROFILE", error);
    return errorRes("Internal Error", 500);
  }
}
