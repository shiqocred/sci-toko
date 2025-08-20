import { createDraftOrder, drafOrder, updateAddressCourier } from "@/lib/api";
import { errorRes, isAuth, successRes } from "@/lib/auth";
import { isResponse } from "@/lib/utils";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const auth = await isAuth(req);
    if (!auth || auth.email || auth.password || !auth.sub)
      throw errorRes("Unauthorized", 401);

    const { sub: userId } = auth;

    const response = await drafOrder(userId);
    return successRes(response, "Checkout detail");
  } catch (error) {
    if (isResponse(error)) return error;
    console.error("ERROR_GET_CHECKOUT", error);
    return errorRes("Internal Error", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await isAuth(req);
    if (!auth || auth.email || auth.password || !auth.sub)
      throw errorRes("Unauthorized", 401);

    const { sub: userId } = auth;

    await createDraftOrder(userId);

    return successRes(null, "Checkout created");
  } catch (error) {
    if (isResponse(error)) return error;
    console.log("ERROR_CREATE_CHECKOUT", error);
    return errorRes("Internal Error", 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const auth = await isAuth(req);
    if (!auth || auth.email || auth.password || !auth.sub)
      throw errorRes("Unauthorized", 401);

    const { sub: userId } = auth;

    await updateAddressCourier(req, userId);

    return successRes(null, "Checkout updated");
  } catch (error) {
    if (isResponse(error)) return error;
    console.log("ERROR_UPDATE_CHECKOUT", error);
    return errorRes("Internal Error", 500);
  }
}
