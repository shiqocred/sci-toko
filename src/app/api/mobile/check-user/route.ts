import { errorRes, isAuth, successRes } from "@/lib/auth";
import { db } from "@/lib/db";
import { isResponse } from "@/lib/utils";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const auth = await isAuth(req);
    if (!auth || auth.email || auth.password || !auth.sub)
      return errorRes("Unauthorized", 401);

    const { sub: userId } = auth;

    const user = await db.query.users.findFirst({
      columns: {
        id: true,
        email: true,
        emailVerified: true,
        name: true,
        role: true,
      },
      where: (u, { eq }) => eq(u.id, userId),
    });

    if (!user) throw errorRes("Unauthorize", 401);

    return successRes(user, "Authorized");
  } catch (error) {
    if (isResponse(error)) return error;

    console.log("ERROR_CHECK_USER", error);
    return errorRes("Internal Error", 500);
  }
}
