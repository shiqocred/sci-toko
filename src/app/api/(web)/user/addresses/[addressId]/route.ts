import { deleteAddress, detailAddress, updateAddress } from "@/lib/api";
import { auth, errorRes, successRes } from "@/lib/auth";
import { isResponse } from "@/lib/utils";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ addressId: string }> }
) {
  try {
    const { addressId } = await params;
    const isAuth = await auth();
    if (!isAuth) return errorRes("Unauthorized", 401);

    const response = await detailAddress(addressId);

    return successRes(response, "Address Detail");
  } catch (error) {
    if (isResponse(error)) return error;

    console.log("ERROR_SHOW_ADDRESS", error);
    return errorRes("Internal Error", 500);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ addressId: string }> }
) {
  try {
    const { addressId } = await params;
    const isAuth = await auth();
    if (!isAuth) return errorRes("Unauthorized", 401);

    const userId = isAuth.user.id;

    const response = await updateAddress(req, userId, addressId);

    return successRes(response, "Address successfully updated");
  } catch (error) {
    if (isResponse(error)) return error;
    console.log("ERROR_UPDATED_ADDRESS", error);
    return errorRes("Internal Error", 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ addressId: string }> }
) {
  try {
    const { addressId } = await params;
    const isAuth = await auth();
    if (!isAuth) return errorRes("Unauthorized", 401);

    const userId = isAuth.user.id;

    await deleteAddress(userId, addressId);

    return successRes(null, "Address successfully deleted");
  } catch (error) {
    console.log("ERROR_DELETED_ADDRESS", error);
    return errorRes("Internal Error", 500);
  }
}
