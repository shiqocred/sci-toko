import { errorRes } from "@/lib/auth";
import { addresses, db } from "@/lib/db";
import { and, asc, desc, eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import { z } from "zod/v4";

const addressSchema = z.object({
  name: z.string().min(1, { message: "Full name is required" }),
  phone: z.string().min(1, { message: "Phone number is required" }),
  address: z.string().min(1, { message: "Address is required" }),
  province: z.string().min(1, { message: "Province is required" }).optional(),
  city: z.string().min(1, { message: "City is required" }).optional(),
  district: z.string().min(1, { message: "District is required" }).optional(),
  longitude: z.string().min(1, { message: "Longitude is required" }),
  latitude: z.string().min(1, { message: "Latitude is required" }),
  detail: z.string().min(1, { message: "Detail address is required" }),
  postal_code: z
    .string()
    .min(1, { message: "Postal code address is required" }),
  is_default: z.boolean(),
});

export const addressesList = async (userId: string) => {
  const address = await db.query.addresses.findMany({
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
    },
    where: (a, { eq }) => eq(a.userId, userId),
    orderBy: [desc(addresses.isDefault), asc(addresses.name)],
  });

  const response = address.map((item) => ({
    id: item.id,
    name: item.name,
    detail: item.detail,
    isDefault: item.isDefault,
    phone: item.phoneNumber,
    address: `${item.address}, ${item.district}, ${item.city}, ${item.province}, ${item.postalCode}`,
  }));

  return response;
};

export const createAddress = async (req: NextRequest, userId: string) => {
  const body = await req.json();

  const result = addressSchema.safeParse(body);

  if (!result.success) {
    const errors: Record<string, string> = {};

    result.error.issues.forEach((err) => {
      const path = err.path.join(".");
      errors[path] = err.message;
    });

    throw errorRes("Validation failed", 422, errors);
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

  console.log(result.data);

  if (is_default) {
    await db
      .update(addresses)
      .set({ isDefault: false })
      .where(and(eq(addresses.userId, userId), eq(addresses.isDefault, true)));
  }

  const [address] = await db
    .insert(addresses)
    .values({
      address: addressReq,
      city: city ?? "",
      district: district ?? "",
      latitude,
      longitude,
      name,
      phoneNumber: phone,
      province: province ?? "",
      postalCode: postal_code,
      userId,
      detail,
      isDefault: is_default,
    })
    .returning({ id: addresses.id });

  return address;
};
