import { auth, errorRes, successRes } from "@/lib/auth";
import { addresses, db } from "@/lib/db";
import { and, eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import { z } from "zod/v4";

const addressSchema = z.object({
  name: z.string().min(1, { message: "Full name is required" }),
  phone: z.string().min(1, { message: "Phone number is required" }),
  address: z.string().min(1, { message: "Address is required" }),
  province: z.string().min(1, { message: "Province is required" }),
  city: z.string().min(1, { message: "City is required" }),
  district: z.string().min(1, { message: "District is required" }),
  longitude: z.string().min(1, { message: "Longitude is required" }),
  latitude: z.string().min(1, { message: "Latitude is required" }),
  detail: z.string().min(1, { message: "Detail address is required" }),
  postal_code: z
    .string()
    .min(1, { message: "Postal code address is required" }),
  is_default: z.boolean(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ addressId: string }> }
) {
  try {
    const { addressId } = await params;
    const isAuth = await auth();
    if (!isAuth) return errorRes("Unauthorized", 401);

    const userId = isAuth.user.id;

    const address = await db.query.addresses.findFirst({
      columns: {
        id: true,
        address: true,
        city: true,
        detail: true,
        isDefault: true,
        name: true,
        phoneNumber: true,
        district: true,
        province: true,
        postalCode: true,
        latitude: true,
        longitude: true,
      },
      where: (a, { eq, and }) => and(eq(a.userId, userId), eq(a.id, addressId)),
    });

    if (!address) return errorRes("Address not found", 404);

    return successRes(address, "Address Detail");
  } catch (error) {
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

    const body = await req.json();

    const result = addressSchema.safeParse(body);

    if (!result.success) {
      const errors: Record<string, string> = {};

      result.error.issues.forEach((err) => {
        const path = err.path.join(".");
        errors[path] = err.message;
      });

      return errorRes("Validation failed", 422, errors);
    }

    const {
      name,
      phone,
      address: addressReq,
      province,
      city,
      district,
      longitude,
      latitude,
      is_default,
      detail,
      postal_code,
    } = result.data;

    if (is_default) {
      await db
        .update(addresses)
        .set({ isDefault: false })
        .where(
          and(eq(addresses.userId, userId), eq(addresses.isDefault, true))
        );
    }

    const [address] = await db
      .update(addresses)
      .set({
        address: addressReq,
        city,
        district,
        latitude,
        longitude,
        name,
        phoneNumber: phone,
        province,
        postalCode: postal_code,
        detail,
        isDefault: is_default,
      })
      .where(eq(addresses.id, addressId))
      .returning({ id: addresses.id });

    return successRes(address, "Address successfully updated");
  } catch (error) {
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

    await db
      .delete(addresses)
      .where(and(eq(addresses.id, addressId), eq(addresses.userId, userId)));

    return successRes(null, "Address successfully deleted");
  } catch (error) {
    console.log("ERROR_DELETED_ADDRESS", error);
    return errorRes("Internal Error", 500);
  }
}
