import { r2Public } from "@/config";
import { updateUser } from "@/lib/api";
import { errorRes, isAuth, successRes } from "@/lib/auth";
import { db } from "@/lib/db";
import { isResponse } from "@/lib/utils";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const auth = await isAuth(req);

    if (!auth || auth.email || auth.password || !auth.sub)
      throw errorRes("Unauthorized", 401);

    const { sub: userId } = auth;

    const userRes = await db.query.users.findFirst({
      columns: {
        id: true,
        email: true,
        emailVerified: true,
        image: true,
        name: true,
        phoneNumber: true,
        role: true,
      },
      where: (u, { eq }) => eq(u.id, userId),
    });

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
    const auth = await isAuth(req);

    if (!auth || auth.email || auth.password || !auth.sub)
      throw errorRes("Unauthorized", 401);

    const { sub: userId } = auth;

    const response = await updateUser(req, userId);

    return successRes(response, "User successfully updated");
  } catch (error) {
    if (isResponse(error)) return error;

    console.log("ERROR_UPDATE_PROFILE", error);
    return errorRes("Internal Error", 500);
  }
}
