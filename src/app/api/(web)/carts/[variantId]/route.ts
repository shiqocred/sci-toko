import { auth, errorRes, successRes } from "@/lib/auth";
import { carts, db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import { z } from "zod/v4";

const quantitySchema = z.object({
  qty: z.string().min(1, { message: "Quantity is required" }),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ variantId: string }> }
) {
  try {
    const isAuth = await auth();
    if (!isAuth) return errorRes("Unauthorized", 401);

    const { variantId } = await params;

    if (!variantId) return errorRes("Variant id is required", 422);

    const body = await req.json();

    const result = quantitySchema.safeParse(body);

    if (!result.success) {
      const errors: Record<string, string> = {};

      result.error.issues.forEach((err) => {
        const path = err.path.join(".");
        errors[path] = err.message;
      });

      return errorRes("Validation failed", 422, errors);
    }

    const { qty } = result.data;

    console.log(qty, parseFloat(qty));

    const cartExits = await db.query.carts.findFirst({
      columns: {
        id: true,
        quantity: true,
      },
      where: (c, { eq }) => eq(c.variantId, variantId),
    });

    if (!cartExits) return errorRes("Cart not found", 404);

    if (parseFloat(qty) < 1) {
      await db.delete(carts).where(eq(carts.id, cartExits.id));
    } else {
      const [update] = await db
        .update(carts)
        .set({
          quantity: qty,
        })
        .where(eq(carts.id, cartExits.id))
        .returning({ qty: carts.quantity });

      console.log("aa", update, qty, cartExits.id);
    }

    return successRes(null, `Quantity cart successfully updated`);
  } catch (error) {
    console.error("ERROR_QUANTITY_CART", error);
    return errorRes("Internal Error", 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ variantId: string }> }
) {
  try {
    const isAuth = await auth();
    if (!isAuth) return errorRes("Unauthorized", 401);

    const { variantId } = await params;

    if (!variantId) return errorRes("Variant id is required", 422);

    const cartExits = await db.query.carts.findFirst({
      columns: {
        id: true,
      },
      where: (c, { eq }) => eq(c.variantId, variantId),
    });

    if (!cartExits) return errorRes("Cart not found", 404);

    await db.delete(carts).where(eq(carts.id, cartExits.id));

    return successRes(null, `Cart successfully deleted`);
  } catch (error) {
    console.error("ERROR_DELETE_CART", error);
    return errorRes("Internal Error", 500);
  }
}
