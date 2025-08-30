import { r2Public } from "@/config";
import { errorRes } from "@/lib/auth";
import {
  carts,
  db,
  orderDraft,
  orderDraftItems,
  orderDraftShippings,
  products,
  productVariants,
} from "@/lib/db";
import { formatRupiah } from "@/lib/utils";
import { createId } from "@paralleldrive/cuid2";
import { and, eq, inArray, isNull } from "drizzle-orm";

export const drafOrder = async (userId: string) => {
  // ✅ Parallel queries untuk data dasar
  const [draftOrder, storeAddress, userExist] = await Promise.all([
    db.query.orderDraft.findFirst({
      columns: {
        id: true,
        totalPrice: true,
        addressId: true,
        discountId: true,
        totalDiscount: true,
        freeShippingId: true,
      },
      where: (o, { eq }) => eq(o.userId, userId),
    }),
    db.query.storeDetail.findFirst(),
    db.query.users.findFirst({
      columns: { id: true, role: true }, // ✅ hanya ambil kolom yang dibutuhkan
      where: (u, { eq }) => eq(u.id, userId),
    }),
  ]);

  // ✅ Early validation
  if (!userExist) throw errorRes("Unauthorized", 401);
  if (!draftOrder) throw errorRes("No draft order found", 400);
  if (!storeAddress) throw errorRes("Store address not found", 400);

  // ✅ Ambil items dengan satu query
  const items = await db
    .select({
      id: orderDraftItems.id,
      variantId: orderDraftItems.variantId,
      price: orderDraftItems.price,
      quantity: orderDraftItems.quantity,
      weight: orderDraftItems.weight,
    })
    .from(orderDraftItems)
    .where(eq(orderDraftItems.orderDraftId, draftOrder.id));

  if (items.length === 0) throw errorRes("No item in order", 400);

  const variantIds = items.map((i) => i.variantId);

  const discountId = draftOrder.discountId;

  // ✅ Parallel queries untuk data produk dan discount
  const [variants, discount] = await Promise.all([
    db
      .select()
      .from(productVariants)
      .where(inArray(productVariants.id, variantIds)),
    discountId
      ? db.query.discounts.findFirst({
          where: (d, { eq }) => eq(d.id, discountId),
        })
      : Promise.resolve(null),
  ]);

  // ✅ Validasi discount
  if (discountId && !discount) {
    throw errorRes("Discount not available", 400);
  }

  const productIds = [...new Set(variants.map((v) => v.productId))];

  // ✅ Parallel queries untuk produk dan gambar
  const [productList, images] = await Promise.all([
    db.query.products.findMany({
      columns: { id: true, name: true, categoryId: true, supplierId: true },
      where: (p, { inArray, isNull, and }) =>
        and(inArray(p.id, productIds), isNull(p.deletedAt)),
    }),
    db.query.productImages.findMany({
      columns: { url: true, productId: true },
      where: (pi, { inArray }) => inArray(pi.productId, productIds),
      orderBy: (pi, { asc }) => asc(pi.position),
    }),
  ]);
  const validFreeShipping = await checkFreeShipping(
    draftOrder,
    userExist,
    userId,
    items,
    variantIds,
    productList,
    productIds
  );
  if (draftOrder.freeShippingId !== validFreeShipping) {
    await db
      .update(orderDraft)
      .set({ freeShippingId: validFreeShipping?.id ?? null })
      .where(eq(orderDraft.userId, userId));
  }

  // ✅ Buat maps untuk O(1) lookup
  const imageMap = new Map(
    images.reduce((acc, img) => {
      if (!acc.has(img.productId)) {
        acc.set(img.productId, img.url); // ✅ hanya ambil gambar pertama
      }
      return acc;
    }, new Map<string, string>())
  );

  const itemMaps = items.reduce(
    (acc, item) => {
      acc.price.set(item.variantId, item.price);
      acc.quantity.set(item.variantId, item.quantity);
      return acc;
    },
    {
      price: new Map<string, string>(),
      quantity: new Map<string, string>(),
    }
  );

  // ✅ Format produk dengan algoritma lebih efisien
  const variantsByProduct = variants.reduce(
    (acc, variant) => {
      if (!acc[variant.productId]) acc[variant.productId] = [];
      acc[variant.productId].push(variant);
      return acc;
    },
    {} as Record<string, typeof variants>
  );

  const productsFormatted = productList.map((product) => {
    const productVariants = variantsByProduct[product.id] || [];
    const defaultVariant = productVariants.find((v) => v.isDefault);
    const otherVariants = productVariants.filter((v) => !v.isDefault);

    return {
      id: product.id,
      title: product.name,
      image: imageMap.has(product.id)
        ? `${r2Public}/${imageMap.get(product.id)}`
        : null,
      default_variant: defaultVariant && {
        id: defaultVariant.id,
        name: defaultVariant.name,
        price: itemMaps.price.get(defaultVariant.id) ?? "0",
        qty: itemMaps.quantity.get(defaultVariant.id) ?? "0",
      },
      variants: otherVariants.map((variant) => ({
        id: variant.id,
        name: variant.name,
        price: itemMaps.price.get(variant.id) ?? "0",
        qty: itemMaps.quantity.get(variant.id) ?? "0",
      })),
    };
  });

  return {
    total_item: items.length,
    price: Number(draftOrder.totalPrice),
    products: productsFormatted,
    total_discount: Number(draftOrder.totalDiscount),
    freeShipping: validFreeShipping?.id ?? null,
    discount: discount
      ? {
          code: discount.code,
          value:
            discount.valueType === "percentage"
              ? `${discount.value}%`
              : formatRupiah(discount.value ?? "0"),
        }
      : null,
    addressId: draftOrder.addressId,
  };
};

// ✅ Pisahkan logika free shipping ke fungsi terpisah
async function checkFreeShipping(
  draftOrder: any,
  userExist: any,
  userId: string,
  items: any[],
  variantIds: string[],
  productList: any[],
  productIds: string[]
): Promise<{ id: string } | null> {
  const now = new Date();
  const activeFreeShippings = await db.query.freeShippings.findMany({
    where: (fs, { lte, gte, and, isNull, or }) =>
      and(lte(fs.startAt, now), or(isNull(fs.endAt), gte(fs.endAt, now))),
  });

  if (activeFreeShippings.length === 0) return null;

  // ✅ Pre-calculate values yang sering dipakai
  const totalPrice = Number(draftOrder.totalPrice);
  const totalQty = items.reduce((sum, v) => sum + Number(v.quantity ?? 0), 0);
  const categoryIds = productList.map((i) => i.categoryId as string);
  const supplierIds = productList.map((i) => i.supplierId as string);

  // ✅ Batch query untuk semua eligibilities dan applies
  const freeShippingIds = activeFreeShippings.map((fs) => fs.id);
  const [eligibilities, applies, productToPets] = await Promise.all([
    db.query.freeShippingEligibilities.findMany({
      where: (fse, { inArray }) => inArray(fse.freeShippingId, freeShippingIds),
    }),
    db.query.freeShippingApplies.findMany({
      where: (fa, { inArray }) => inArray(fa.freeShippingId, freeShippingIds),
    }),
    db.query.productToPets.findMany({
      where: (pp, { inArray }) => inArray(pp.productId, productIds),
    }),
  ]);

  const petIds = productToPets.map((i) => i.petId);

  // ✅ Group data untuk lookup yang lebih cepat
  const eligibilityMap = eligibilities.reduce(
    (acc, e) => {
      if (!acc[e.freeShippingId]) acc[e.freeShippingId] = [];
      acc[e.freeShippingId].push(e);
      return acc;
    },
    {} as Record<string, typeof eligibilities>
  );

  const appliesMap = applies.reduce(
    (acc, a) => {
      if (!acc[a.freeShippingId]) acc[a.freeShippingId] = [];
      acc[a.freeShippingId].push(a);
      return acc;
    },
    {} as Record<string, typeof applies>
  );

  // ✅ Check setiap free shipping dengan logika yang dioptimasi
  for (const fs of activeFreeShippings) {
    const fsEligibilities = eligibilityMap[fs.id] || [];
    const fsApplies = appliesMap[fs.id] || [];

    // Check eligibility
    let eligible = false;
    if (fs.eligibilityType === "role") {
      eligible = fsEligibilities.some((e) => e.role === userExist.role);
    } else if (fs.eligibilityType === "user") {
      eligible = fsEligibilities.some((e) => e.userId === userId);
    } else {
      eligible = true;
    }

    if (!eligible) continue;

    // Check minimum requirement
    let minOk = true;
    if (fs.minimumType === "amount") {
      minOk = totalPrice >= Number(fs.minimum ?? 0);
    } else if (fs.minimumType === "quantity") {
      minOk = totalQty >= Number(fs.minimum ?? 0);
    }
    if (!minOk) continue;

    // Check apply conditions
    let applyOk = true;
    if (fs.apply === "products") {
      applyOk = fsApplies.some((a) => variantIds.includes(a.variantId ?? ""));
    } else if (fs.apply === "categories") {
      applyOk = fsApplies.some((a) => categoryIds.includes(a.categoryId ?? ""));
    } else if (fs.apply === "suppliers") {
      applyOk = fsApplies.some((a) => supplierIds.includes(a.supplierId ?? ""));
    } else if (fs.apply === "pets") {
      applyOk = fsApplies.some((a) => petIds.includes(a.petId ?? ""));
    }

    if (applyOk) {
      return { id: fs.id };
    }
  }

  return null;
}

export const createDraftOrder = async (userId: string) => {
  const user = await db.query.users.findFirst({
    columns: { role: true },
    where: (u, { eq }) => eq(u.id, userId),
  });

  if (!user) throw errorRes("Unauthorized", 401);

  const orderDraftExist = await db.query.orderDraft.findMany({
    columns: { id: true },
    where: (od, { eq }) => eq(od.userId, userId),
  });

  const orderDraftIds = orderDraftExist.map((i) => i.id);

  await db.transaction(async (tx) => {
    if (orderDraftIds.length > 0) {
      await tx
        .delete(orderDraftShippings)
        .where(inArray(orderDraftShippings.orderDraftId, orderDraftIds));
      await tx.delete(orderDraft).where(inArray(orderDraft.id, orderDraftIds));
    }

    const [addressDefault, variantSelected] = await Promise.all([
      tx.query.addresses.findFirst({
        where: (a, { eq, and }) =>
          and(eq(a.userId, userId), eq(a.isDefault, true)),
      }),

      tx
        .select({
          variantId: carts.variantId,
          qty: carts.quantity,
          weight: productVariants.weight,
          stock: productVariants.stock,
          productId: productVariants.productId,
          productStatus: products.status,
        })
        .from(carts)
        .leftJoin(productVariants, eq(carts.variantId, productVariants.id))
        .leftJoin(
          products,
          and(
            eq(productVariants.productId, products.id),
            isNull(products.deletedAt)
          )
        )
        .where(and(eq(carts.userId, userId), eq(carts.checked, true))),
    ]);

    const variantIds = variantSelected.map((i) => i.variantId);
    const productIds = variantSelected.map((i) => i.productId as string);

    const [pricing, availableRoles] = await Promise.all([
      tx.query.productVariantPrices.findMany({
        where: (pp, { inArray }) => inArray(pp.variantId, variantIds),
      }),
      tx.query.productAvailableRoles.findMany({
        where: (r, { inArray }) => inArray(r.productId, productIds),
      }),
    ]);

    // Buat map productId -> set of roles yang diijinkan
    const roleMap = new Map<string, Set<string>>();
    for (const r of availableRoles) {
      if (!roleMap.has(r.productId)) roleMap.set(r.productId, new Set());
      roleMap.get(r.productId)!.add(r.role);
    }

    // Filter variant dengan syarat:
    // - stok > 0
    // - qty <= stok
    // - productStatus = true
    // - user.role ada di productAvailableRoles
    const variantWithSufficientStock = variantSelected.filter(
      ({ stock, qty, productStatus, productId }) => {
        const s = Number(stock ?? 0);
        const q = Number(qty ?? 0);
        const allowedRoles = roleMap.get(productId as string) ?? new Set();
        return (
          productStatus === true &&
          s > 0 &&
          q <= s &&
          allowedRoles.has(user.role)
        );
      }
    );

    if (variantWithSufficientStock.length === 0) {
      throw errorRes("No items available for checkout", 400);
    }

    // Helper ambil harga sesuai role
    const getPrice = (variantId: string) => {
      const items = pricing.filter((i) => i.variantId === variantId);
      if (user.role === "PETSHOP")
        return Number(items.find((i) => i.role === "PETSHOP")?.price || "10");
      if (user.role === "VETERINARIAN")
        return Number(
          items.find((i) => i.role === "VETERINARIAN")?.price || "20"
        );
      return Number(items.find((i) => i.role === "BASIC")?.price || "30");
    };

    // Hitung total berat & harga
    let totalWeight = 0;
    let totalPrice = 0;
    for (const item of variantWithSufficientStock) {
      const qty = Number(item.qty ?? 0);
      totalWeight += Number(item.weight ?? 0) * qty;
      totalPrice += getPrice(item.variantId) * qty; // per variant * qty
    }

    const orderDraftId = createId();

    // Insert orderDraft
    await tx.insert(orderDraft).values({
      id: orderDraftId,
      userId,
      totalPrice: totalPrice.toString(),
      addressId: addressDefault?.id,
      totalWeight: totalWeight.toString(),
    });

    // Insert orderDraftItems
    await tx.insert(orderDraftItems).values(
      variantWithSufficientStock.map((item) => ({
        orderDraftId,
        variantId: item.variantId,
        price: getPrice(item.variantId).toString(),
        quantity: item.qty,
        weight: item.weight ?? "0",
      }))
    );
  });
};
