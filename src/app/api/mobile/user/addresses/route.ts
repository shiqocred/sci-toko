import { addressesList, createAddress } from "@/lib/api";
import { errorRes, isAuth, successRes } from "@/lib/auth";
import { isResponse } from "@/lib/utils";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const auth = await isAuth(req);

    if (!auth || auth.email || auth.password || !auth.sub)
      throw errorRes("Unauthorized", 401);

    const { sub: userId } = auth;

    const response = await addressesList(userId);

    return successRes(response, "Address List");
  } catch (error) {
    if (isResponse(error)) return error;

    console.log("ERROR_LIST_ADDRESS", error);
    return errorRes("Internal Error", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await isAuth(req);

    if (!auth || auth.email || auth.password || !auth.sub)
      throw errorRes("Unauthorized", 401);

    const { sub: userId } = auth;

    const response = await createAddress(req, userId);

    return successRes(response, "Address successfully created");
  } catch (error) {
    if (isResponse(error)) return error;

    console.log("ERROR_ADD_ADDRESS", error);
    return errorRes("Internal Error", 500);
  }
}
