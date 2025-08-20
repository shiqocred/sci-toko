import { createDraftOrder, drafOrder, updateAddressCourier } from "@/lib/api";
import { auth, errorRes, successRes } from "@/lib/auth";
import { isResponse } from "@/lib/utils";
import { NextRequest } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session) return errorRes("Unauthorized", 401);

    const userId = session.user.id;

    const response = await drafOrder(userId);
    return successRes(response, "Checkout detail");
  } catch (error) {
    if (isResponse(error)) return error;
    console.error("ERROR_GET_CHECKOUT", error);
    return errorRes("Internal Error", 500);
  }
}

export async function POST() {
  try {
    const isAuth = await auth();
    if (!isAuth) return errorRes("Unauthorized", 401);

    const userId = isAuth.user.id;

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
    const session = await auth();
    if (!session) return errorRes("Unauthorized", 401);

    const userId = session.user.id;

    await updateAddressCourier(req, userId);

    return successRes(null, "Checkout updated");
  } catch (error) {
    if (isResponse(error)) return error;
    console.log("ERROR_UPDATE_CHECKOUT", error);
    return errorRes("Internal Error", 500);
  }
}
