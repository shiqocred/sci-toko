import { updateStatusAddress } from "@/lib/api";
import { errorRes, isAuth, successRes } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ addressId: string }> }
) {
  try {
    const { addressId } = await params;
    const auth = await isAuth(req);

    if (!auth || auth.email || auth.password || !auth.sub)
      throw errorRes("Unauthorized", 401);

    const { sub: userId } = auth;

    const response = await updateStatusAddress(userId, addressId);

    return successRes(
      response,
      "The address has been successfully set as default"
    );
  } catch (error) {
    console.log("ERROR_SET_DEFAULT_ADDRESS", error);
    return errorRes("Internal Error", 500);
  }
}
