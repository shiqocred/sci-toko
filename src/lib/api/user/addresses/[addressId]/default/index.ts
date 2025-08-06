import { errorRes } from "@/lib/auth";
import { addresses, db } from "@/lib/db";
import { eq } from "drizzle-orm";

export const updateStatusAddress = async (
  userId: string,
  addressId: string
) => {
  const isDefault = await db.query.addresses.findFirst({
    columns: {
      id: true,
      isDefault: true,
    },
    where: (a, { eq, and }) => and(eq(a.id, addressId), eq(a.userId, userId)),
  });

  if (!isDefault) throw errorRes("Address is required", 404);
  if (isDefault.isDefault) throw errorRes("Address is required");

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

  return address;
};
