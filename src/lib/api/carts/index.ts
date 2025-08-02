import { r2Public } from "@/config";
import { errorRes, successRes } from "@/lib/auth";
import { carts, db, productImages, products, productVariants } from "@/lib/db";
import { and, eq, inArray, sql } from "drizzle-orm";
import { NextRequest } from "next/server";
import { z } from "zod/v4";

const cartSchema = z.object({
  variant_id: z.string().min(1, { message: "Variant Id is required" }),
  quantity: z.string().min(1, { message: "Quantity is required" }),
});

const cartEditSchema = z.object({
  variant_ids: z
    .array(z.string().min(1, { message: "Variant id is required" }))
    .min(1, { message: "Variant ids at least includes one of variant id" }),
  checked: z.boolean(),
});

export const cartsList = async (
  userId: string,
  userRole: "VETERINARIAN" | "BASIC" | "PETSHOP" | "ADMIN"
) => {
  // 1. Ambil cart + variant + product sekaligus
  const cartItems = await db
    .select({
      variantId: carts.variantId,
      quantity: carts.quantity,
      checked: carts.checked,
      productId: productVariants.productId,
      variantName: productVariants.name,
      stock: productVariants.stock,
      basicPrice: productVariants.basicPrice,
      petShopPrice: productVariants.petShopPrice,
      doctorPrice: productVariants.doctorPrice,
      isDefault: productVariants.isDefault,
      productName: products.name,
      productSlug: products.slug,
    })
    .from(carts)
    .innerJoin(productVariants, eq(carts.variantId, productVariants.id))
    .innerJoin(products, eq(productVariants.productId, products.id))
    .where(eq(carts.userId, userId));

  if (cartItems.length === 0) return successRes({ products: [] });

  // 2. Ekstrak productIds untuk ambil gambar
  const productIds = [...new Set(cartItems.map((c) => c.productId))];

  // 3. Ambil 1 gambar pertama per produk (menggunakan subquery)
  const imageSubquery = db
    .select({
      productId: productImages.productId,
      minId: sql<number>`MIN(${productImages.id})`.as("minId"),
    })
    .from(productImages)
    .where(inArray(productImages.productId, productIds))
    .groupBy(productImages.productId)
    .as("image_subquery");

  // Join dengan tabel asli untuk ambil url
  const firstImagesResult = await db
    .select({
      productId: productImages.productId,
      url: productImages.url,
    })
    .from(productImages)
    .innerJoin(imageSubquery, eq(productImages.id, imageSubquery.minId));

  const imageMap = new Map(
    firstImagesResult.map((img) => [img.productId, img.url])
  );

  // 4. Buat lookup untuk harga berdasarkan role
  const getPrice = (item: (typeof cartItems)[0]): string => {
    if (userRole === "VETERINARIAN") return item.doctorPrice || "0";
    if (userRole === "PETSHOP") return item.petShopPrice || "0";
    return item.basicPrice || "0";
  };

  // 5. Bangun struktur produk langsung
  const productMap = new Map<string, any>();
  let subtotal = 0;

  for (const item of cartItems) {
    const price = getPrice(item);
    const quantity = Number(item.quantity ?? 0);
    const total = Number(price ?? 0) * quantity;
    const variant = {
      id: item.variantId,
      name: item.variantName,
      checked: item.checked,
      quantity,
      stock: Number(item.stock ?? 0),
      price: Number(price),
      total,
    };

    subtotal += item.checked ? total : 0;

    if (!productMap.has(item.productId)) {
      productMap.set(item.productId, {
        id: item.productId,
        name: item.productName,
        slug: item.productSlug,
        image: imageMap.get(item.productId)
          ? `${r2Public}/${imageMap.get(item.productId)}`
          : null,
        default_variant: null,
        variants: [],
      });
    }

    const product = productMap.get(item.productId);
    if (item.isDefault) {
      product.default_variant = variant;
    } else {
      product.variants.push(variant);
    }
  }

  // 6. Finalisasi struktur: default_variant vs variants
  const result = Array.from(productMap.values()).map((product) => {
    if (product.default_variant) {
      product.variants = null;
    } else if (product.variants.length === 0) {
      product.variants = null;
    } else {
      product.default_variant = null;
    }
    return product;
  });

  const response = {
    products: result,
    subtotal,
    total_cart_selected: cartItems.filter((item) => item.checked).length,
    total_cart: cartItems.length,
    total: subtotal,
  };

  return response;
};

export const addToCart = async (req: NextRequest, userId: string) => {
  const body = await req.json();

  const result = cartSchema.safeParse(body);

  if (!result.success) {
    const errors: Record<string, string> = {};

    result.error.issues.forEach((err) => {
      const path = err.path.join(".");
      errors[path] = err.message;
    });

    throw errorRes("Validation failed", 422, errors);
  }

  const { quantity, variant_id } = result.data;

  const variantExist = await db.query.carts.findFirst({
    columns: {
      id: true,
      quantity: true,
    },
    where: (c, { eq }) => eq(c.variantId, variant_id),
  });

  if (variantExist) {
    await db
      .update(carts)
      .set({
        quantity: (
          parseFloat(variantExist.quantity) + parseFloat(quantity)
        ).toString(),
      })
      .where(eq(carts.id, variantExist.id));
  } else {
    await db.insert(carts).values({
      userId,
      quantity,
      variantId: variant_id,
    });
  }
};

export const checkedCart = async (req: NextRequest, userId: string) => {
  const body = await req.json();

  const result = cartEditSchema.safeParse(body);

  if (!result.success) {
    const errors: Record<string, string> = {};

    result.error.issues.forEach((err) => {
      const path = err.path.join(".");
      errors[path] = err.message;
    });

    throw errorRes("Validation failed", 422, errors);
  }

  const { variant_ids, checked } = result.data;

  await db
    .update(carts)
    .set({ checked })
    .where(and(eq(carts.userId, userId), inArray(carts.variantId, variant_ids)))
    .returning();
};
