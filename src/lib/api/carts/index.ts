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
  // 1. Ambil cart + variant + product
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

  if (cartItems.length === 0)
    return successRes({ in_stock: [], out_of_stock: [] });

  // 2. Ambil gambar
  const productIds = [...new Set(cartItems.map((c) => c.productId))];
  const imageSubquery = db
    .select({
      productId: productImages.productId,
      minId: sql<number>`MIN(${productImages.id})`.as("minId"),
    })
    .from(productImages)
    .where(inArray(productImages.productId, productIds))
    .groupBy(productImages.productId)
    .as("image_subquery");

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

  // 3. Fungsi ambil harga sesuai role
  const getPrice = (item: (typeof cartItems)[0]): string => {
    if (userRole === "VETERINARIAN") return item.doctorPrice || "0";
    if (userRole === "PETSHOP") return item.petShopPrice || "0";
    return item.basicPrice || "0";
  };

  // 4. Map produk in-stock & out-of-stock
  const inStockMap = new Map<string, any>();
  const outOfStockMap = new Map<string, any>();

  let subtotal = 0;

  for (const item of cartItems) {
    const stock = Number(item.stock ?? 0);
    let quantity = Number(item.quantity ?? 0);

    // Kalau stock 0 → masuk outOfStock
    if (stock <= 0) {
      addToMap(outOfStockMap, item, 0);
      continue;
    }

    // Kalau quantity > stock → update carts dan pakai stock
    if (quantity > stock) {
      quantity = stock;
      await db
        .update(carts)
        .set({ quantity: String(stock) })
        .where(
          and(eq(carts.userId, userId), eq(carts.variantId, item.variantId))
        );
    }

    const price = Number(getPrice(item));
    const total = price * quantity;

    if (item.checked) subtotal += total;

    addToMap(inStockMap, item, quantity, price, total, stock);
  }

  function addToMap(
    map: Map<string, any>,
    item: (typeof cartItems)[0],
    quantity: number,
    price?: number,
    total?: number,
    stock?: number
  ) {
    const variant = {
      id: item.variantId,
      name: item.variantName,
      checked: item.checked,
      quantity,
      stock: stock ?? Number(item.stock ?? 0),
      price: price ?? Number(getPrice(item)),
      total: total ?? 0,
    };

    if (!map.has(item.productId)) {
      map.set(item.productId, {
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

    const product = map.get(item.productId);
    if (item.isDefault) {
      product.default_variant = variant;
    } else {
      product.variants.push(variant);
    }
  }

  // 5. Format final
  const formatProducts = (map: Map<string, any>) =>
    Array.from(map.values()).map((product) => {
      if (product.default_variant) {
        product.variants = null;
      } else if (!product.variants.length) {
        product.variants = null;
      } else {
        product.default_variant = null;
      }
      return product;
    });

  return {
    products: formatProducts(inStockMap),
    out_of_stock: formatProducts(outOfStockMap),
    subtotal,
    total_cart_selected: cartItems.filter((item) => item.checked).length,
    total_cart: cartItems.length,
    total: subtotal,
  };
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
    console.log("aaa");
    await db
      .update(carts)
      .set({
        quantity: (
          parseFloat(variantExist.quantity) + parseFloat(quantity)
        ).toString(),
      })
      .where(eq(carts.id, variantExist.id));
  } else {
    console.log("aaaa");
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
    .where(
      and(eq(carts.userId, userId), inArray(carts.variantId, variant_ids))
    );
};
