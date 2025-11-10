import { r2Public } from "@/config";
import { errorRes, successRes } from "@/lib/auth";
import { carts, db, productImages, products, productVariants } from "@/lib/db";
import { and, eq, inArray, isNull, sql } from "drizzle-orm";
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

export const cartsList = async (userId: string) => {
  // 1. Ambil role user
  const user = await db.query.users.findFirst({
    columns: { role: true },
    where: (u, { eq }) => eq(u.id, userId),
  });
  if (!user) throw errorRes("Unauthorized", 401);

  // 2. Ambil cart + variant + product
  const cartItems = await db
    .select({
      variantId: carts.variantId,
      quantity: carts.quantity,
      checked: carts.checked,
      productId: productVariants.productId,
      variantName: productVariants.name,
      stock: productVariants.stock,
      isDefault: productVariants.isDefault,
      productName: products.name,
      productSlug: products.slug,
      createdAt: carts.createdAt,
      status: products.status,
    })
    .from(carts)
    .innerJoin(productVariants, eq(carts.variantId, productVariants.id))
    .innerJoin(
      products,
      and(
        eq(productVariants.productId, products.id),
        isNull(products.deletedAt)
      )
    )
    .where(eq(carts.userId, userId));

  if (!cartItems.length) {
    return successRes({ in_stock: [], out_of_stock: [] });
  }

  // 3. Ambil image pertama per product
  const productIds = [...new Set(cartItems.map((c) => c.productId))];
  const variantIds = [...new Set(cartItems.map((c) => c.variantId))];

  const imageSubquery = db
    .select({
      productId: productImages.productId,
      first: sql`MIN(${productImages.position})`.as("first"),
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
    .innerJoin(
      imageSubquery,
      and(
        eq(productImages.productId, imageSubquery.productId),
        eq(productImages.position, imageSubquery.first)
      )
    );

  const imageMap = new Map(
    firstImagesResult.map((img) => [img.productId, img.url])
  );

  // 4. Ambil semua pricing → bikin Map variantId -> rolePrices
  const pricings = await db.query.productVariantPrices.findMany({
    where: (pp, { inArray }) => inArray(pp.variantId, variantIds),
  });

  const pricingMap = new Map<string, Record<string, string>>();
  for (const p of pricings) {
    if (!pricingMap.has(p.variantId)) pricingMap.set(p.variantId, {});
    pricingMap.get(p.variantId)![p.role] = p.price;
  }

  const getPrice = (variantId: string): number => {
    const prices = pricingMap.get(variantId);
    if (!prices) return 0;
    return Number(prices[user.role] ?? prices["BASIC"] ?? 0);
  };

  // 5. Ambil available roles per product
  const availableRolesRes = await db.query.productAvailableRoles.findMany({
    where: (pr, { inArray }) => inArray(pr.productId, productIds),
  });

  const availableRolesMap = new Map<string, Set<string>>();
  for (const row of availableRolesRes) {
    if (!availableRolesMap.has(row.productId)) {
      availableRolesMap.set(row.productId, new Set());
    }
    availableRolesMap.get(row.productId)!.add(row.role);
  }

  // 6. Loop cartItems → bagi in-stock & out-of-stock
  const inStockMap = new Map<string, any>();
  const outOfStockMap = new Map<string, any>();
  let subtotal = 0;

  for (const item of cartItems) {
    const stock = Number(item.stock ?? 0);
    let quantity = Number(item.quantity ?? 0);

    const roleAllowed = (
      availableRolesMap.get(item.productId) ?? new Set()
    ).has(user.role);

    // Out of stock jika stock habis, role tidak diperbolehkan, atau status produk false
    if (stock <= 0 || !roleAllowed || !item.status) {
      addToMap(outOfStockMap, item, 0);
      continue;
    }

    // Jika quantity > stock → sync ke DB
    if (quantity > stock) {
      quantity = stock;
      await db
        .update(carts)
        .set({ quantity: String(stock) })
        .where(
          and(eq(carts.userId, userId), eq(carts.variantId, item.variantId))
        );
    }

    const price = getPrice(item.variantId);
    const total = price * quantity;

    if (item.checked) subtotal += total;

    addToMap(inStockMap, item, quantity, price, total, stock);
  }

  // helper addToMap
  function addToMap(
    map: Map<string, any>,
    item: (typeof cartItems)[0],
    quantity: number,
    price: number = 0,
    total: number = 0,
    stock?: number
  ) {
    const variant = {
      id: item.variantId,
      name: item.variantName,
      checked: item.checked,
      quantity,
      stock: stock ?? Number(item.stock ?? 0),
      price,
      total,
      createdAt: item.createdAt, // 🔹 simpan sementara
    };

    if (!map.has(item.productId)) {
      map.set(item.productId, {
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
    if (item.isDefault) product.default_variant = variant;
    else product.variants.push(variant);
  }

  // 7. Format final product
  const formatProducts = (map: Map<string, any>) =>
    Array.from(map.values())
      // 🔹 sort berdasarkan createdAt desc
      .sort((a, b) => {
        const ca =
          a.default_variant?.createdAt || a.variants?.[0]?.createdAt || 0;
        const cb =
          b.default_variant?.createdAt || b.variants?.[0]?.createdAt || 0;
        return cb - ca; // desc
      })
      .map((product) => {
        // 🔹 hapus createdAt dari variant biar tidak tampil di response
        if (product.default_variant) {
          delete product.default_variant.createdAt;
          product.variants = null;
        } else if (!product.variants.length) {
          product.variants = null;
        } else {
          product.variants.forEach((v: any) => delete v.createdAt);
          product.default_variant = null;
        }
        return product;
      });

  return {
    products: formatProducts(inStockMap),
    out_of_stock: formatProducts(outOfStockMap),
    subtotal,
    total_cart_selected: Array.from(inStockMap.values()).reduce(
      (acc, product) => {
        const variants =
          product.variants ||
          (product.default_variant ? [product.default_variant] : []);
        return acc + variants.filter((v: any) => v.checked).length;
      },
      0
    ),
    total_cart: cartItems.length,
    total: subtotal,
  };
};

export const addToCart = async (req: NextRequest, userId: string) => {
  // 🔹 1. Parse user
  const user = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.id, userId),
    columns: { id: true, role: true },
  });
  if (!user) throw errorRes("Unauthorized", 401);

  // 🔹 2. Parse body (validation dengan Zod)
  const body = await req.json();
  const result = cartSchema.safeParse(body);
  if (!result.success) {
    const errors = Object.fromEntries(
      result.error.issues.map((err) => [err.path.join("."), err.message])
    );
    throw errorRes("Validation failed", 422, errors);
  }

  const { quantity, variant_id } = result.data;

  // 🔹 3. Cari variant & sekaligus productId
  const variant = await db.query.productVariants.findFirst({
    where: (v, { eq }) => eq(v.id, variant_id),
    columns: { id: true, productId: true },
  });
  if (!variant) throw errorRes("Variant not found", 404);

  // 🔹 4. Cek role availability
  const availableRoles = await db.query.productAvailableRoles.findMany({
    where: (pa, { eq }) => eq(pa.productId, variant.productId),
    columns: { role: true },
  });

  if (!availableRoles.some((i) => i.role === user.role)) {
    throw errorRes("Unavailable to buy", 400);
  }

  // 🔹 5. Cek cart existing (khusus user & variant_id)
  const existingCart = await db.query.carts.findFirst({
    columns: { id: true, quantity: true },
    where: (c, { and, eq }) =>
      and(eq(c.variantId, variant_id), eq(c.userId, userId)),
  });

  // 🔹 6. Update kalau sudah ada, insert kalau belum
  if (existingCart) {
    const newQty = parseFloat(existingCart.quantity) + parseFloat(quantity);

    await db
      .update(carts)
      .set({ quantity: newQty.toString(), checked: true })
      .where(eq(carts.id, existingCart.id));
  } else {
    await db.insert(carts).values({
      userId,
      variantId: variant_id,
      checked: true,
      quantity,
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
