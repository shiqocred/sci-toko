import { auth, errorRes, successRes } from "@/lib/auth";
import { addresses, db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ addressId: string }> }
) {
  try {
    const { addressId } = await params;
    const isAuth = await auth();
    if (!isAuth) return errorRes("Unauthorized", 401);

    const userId = isAuth.user.id;

    const isDefault = await db.query.addresses.findFirst({
      columns: {
        id: true,
        isDefault: true,
      },
      where: (a, { eq, and }) => and(eq(a.id, addressId), eq(a.userId, userId)),
    });

    if (!isDefault) return errorRes("Address is required", 404);
    if (isDefault.isDefault) return errorRes("Address is required");

    await db
      .update(addresses)
      .set({
        isDefault: false,
      })
      .where(eq(addresses.userId, userId));

    const [address] = await db
      .update(addresses)
      .set({
        isDefault: true,
      })
      .where(eq(addresses.id, addressId))
      .returning({ id: addresses.id });

    return successRes(
      address,
      "The address has been successfully set as default"
    );
  } catch (error) {
    console.log("ERROR_SET_DEFAULT_ADDRESS", error);
    return errorRes("Internal Error", 500);
  }
}
