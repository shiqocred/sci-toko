import { r2Public } from "@/config";
import { errorRes } from "@/lib/auth";
import {
  carts,
  db,
  discounts,
  orderDraft,
  orderDraftItems,
  orderDraftShippings,
  products,
  productVariants,
} from "@/lib/db";
import { formatRupiah } from "@/lib/utils";
import { createId } from "@paralleldrive/cuid2";
import { and, eq, inArray, InferSelectModel, isNull } from "drizzle-orm";

type DiscountType = InferSelectModel<typeof discounts>;

export const drafOrder = async (userId: string) => {
  const [draftOrder, storeAddress] = await Promise.all([
    db.query.orderDraft.findFirst({
      columns: {
        id: true,
        totalPrice: true,
        addressId: true,
        discountId: true,
        totalDiscount: true,
      },
      where: (o, { eq }) => eq(o.userId, userId),
    }),
    db.query.storeDetail.findFirst(),
  ]);

  if (!draftOrder) throw errorRes("No draft order found", 400);
  if (!storeAddress) throw errorRes("Store address not found", 400);

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
  const variants = await db
    .select()
    .from(productVariants)
    .where(inArray(productVariants.id, variantIds));

  const productIds = [...new Set(variants.map((v) => v.productId))];

  const [productList, images] = await Promise.all([
    db.query.products.findMany({
      columns: { id: true, name: true },
      where: (p, { inArray, isNull, and }) =>
        and(inArray(p.id, productIds), isNull(p.deletedAt)),
    }),
    db.query.productImages.findMany({
      columns: { url: true, productId: true },
      where: (pi, { inArray }) => inArray(pi.productId, productIds),
    }),
  ]);

  let discount: DiscountType | null = null;
  const discountId = draftOrder.discountId;

  if (discountId) {
    const discountExist = await db.query.discounts.findFirst({
      where: (d, { eq }) => eq(d.id, discountId),
    });
    if (!discountExist) return errorRes("Discount not available");
    discount = discountExist;
  }

  // ✅ buat map biar lookup O(1)
  const imageMap = new Map(images.map((img) => [img.productId, img.url]));
  const priceMap = new Map(items.map((i) => [i.variantId, i.price]));
  const qtyMap = new Map(items.map((i) => [i.variantId, i.quantity]));

  // ✅ format produk
  const productsFormatted = productList.map((p) => {
    const relatedVariants = variants.filter((v) => v.productId === p.id);

    const defaultVariant = relatedVariants.find((v) => v.isDefault);
    const otherVariants = relatedVariants.filter((v) => !v.isDefault);

    return {
      id: p.id,
      title: p.name,
      image: imageMap.has(p.id) ? `${r2Public}/${imageMap.get(p.id)}` : null,
      default_variant: defaultVariant && {
        id: defaultVariant.id,
        name: defaultVariant.name,
        price: priceMap.get(defaultVariant.id) ?? "0",
        qty: qtyMap.get(defaultVariant.id) ?? "0",
      },
      variants: otherVariants.map((v) => ({
        id: v.id,
        name: v.name,
        price: priceMap.get(v.id) ?? "0",
        qty: qtyMap.get(v.id) ?? "0",
      })),
    };
  });

  return {
    total_item: items.length,
    price: Number(draftOrder.totalPrice),
    products: productsFormatted,
    total_discount: Number(draftOrder.totalDiscount),
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
