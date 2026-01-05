import { deleteUser, getUser, updateUser } from "@/lib/api";
import { auth, errorRes, successRes } from "@/lib/auth";
import { isResponse } from "@/lib/utils";
import { NextRequest } from "next/server";

export async function GET() {
  try {
    const isAuth = await auth();

    if (!isAuth) return errorRes("Unauthorized", 401);

    const userId = isAuth.user.id;

    const response = await getUser(userId);

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

export async function DELETE(req: NextRequest) {
  try {
    const isAuth = await auth();

    if (!isAuth) return errorRes("Unauthorized", 401);
    const response = await deleteUser(req, isAuth.user.id);

    return successRes(null, response);
  } catch (error) {
    if (isResponse(error)) return error;

    console.log("ERROR_DELETE_ACCOUNT", error);
    return errorRes("Internal Error", 500);
  }
}
