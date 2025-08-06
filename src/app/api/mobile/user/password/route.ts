import { updatePassword } from "@/lib/api";
import { errorRes, isAuth, successRes } from "@/lib/auth";
import { isResponse } from "@/lib/utils";
import { NextRequest } from "next/server";

export async function PUT(req: NextRequest) {
  try {
    const auth = await isAuth(req);

    if (!auth || auth.email || auth.password || !auth.sub)
      throw errorRes("Unauthorized", 401);

    const { sub: userId } = auth;

    await updatePassword(req, userId);

    return successRes(null, "User password successfully updated");
  } catch (error) {
    if (isResponse(error)) return error;
    console.log("ERROR_UPDATE_PASSWORD", error);
    return errorRes("Internal Error", 500);
  }
}
