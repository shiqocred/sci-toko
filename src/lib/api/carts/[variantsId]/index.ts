import { errorRes } from "@/lib/auth";
import { carts, db } from "@/lib/db";
import { and, eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import { z } from "zod/v4";

const quantitySchema = z.object({
  qty: z.string().min(1, { message: "Quantity is required" }),
});

export const quantityCart = async (
  req: NextRequest,
  params: Promise<{ variantId: string }>,
  userId: string
) => {
  const { variantId } = await params;

  if (!variantId) throw errorRes("Variant id is required", 422);

  const body = await req.json();

  const result = quantitySchema.safeParse(body);

  if (!result.success) {
    const errors: Record<string, string> = {};

    result.error.issues.forEach((err) => {
      const path = err.path.join(".");
      errors[path] = err.message;
    });

    throw errorRes("Validation failed", 422, errors);
  }

  const { qty } = result.data;

  const cartExits = await db.query.carts.findFirst({
    columns: {
      id: true,
      quantity: true,
    },
    where: (c, { eq, and }) =>
      and(eq(c.variantId, variantId), eq(c.userId, userId)),
  });

  if (!cartExits) throw errorRes("Cart not found", 404);

  if (parseFloat(qty) < 1) {
    await db
      .delete(carts)
      .where(and(eq(carts.id, cartExits.id), eq(carts.userId, userId)));
  } else {
    await db
      .update(carts)
      .set({
        quantity: qty,
      })
      .where(and(eq(carts.id, cartExits.id), eq(carts.userId, userId)));
  }
};

export const deleteCart = async (
  params: Promise<{ variantId: string }>,
  userId: string
) => {
  const { variantId } = await params;

  if (!variantId) return errorRes("Variant id is required", 422);

  const cartExits = await db.query.carts.findFirst({
    columns: {
      id: true,
    },
    where: (c, { eq, and }) =>
      and(eq(c.variantId, variantId), eq(c.userId, userId)),
  });

  if (!cartExits) throw errorRes("Cart not found", 404);

  await db.delete(carts).where(eq(carts.id, cartExits.id));
};
