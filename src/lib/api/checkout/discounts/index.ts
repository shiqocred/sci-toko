import { errorRes } from "@/lib/auth";
import {
  db,
  discounts,
  discountToRoles,
  discountUsers,
  orderDraft,
  orderDraftItems,
  orders,
  products,
  productToPets,
  productVariants,
} from "@/lib/db";
import {
  and,
  eq,
  exists,
  inArray,
  InferSelectModel,
  isNull,
  sql,
} from "drizzle-orm";
import { NextRequest } from "next/server";

type ApplyType = InferSelectModel<typeof discounts>["apply"];
type DraftItem = { variantId: string; quantity: string; price: string };
type RoleType = InferSelectModel<typeof discountToRoles>["role"];

export const applyDiscount = async (req: NextRequest, userId: string) => {
  const { voucher } = await req.json();
  if (!voucher) throw errorRes("Voucher is required", 400);

  const now = new Date();

  // Ambil discount terlebih dulu (tanpa guard waktu aktif)
  const discount = await db.query.discounts.findFirst({
    where: (d, { eq, and, isNull }) =>
      and(eq(d.code, voucher), isNull(d.deletedAt)),
  });

  if (!discount) throw errorRes("Voucher not found", 404);

  // Cek periode aktif
  if (discount.startAt > now || (discount.endAt && discount.endAt < now)) {
    throw errorRes("Voucher expired", 400);
  }

  // Paralel: user role + draft + items
  const [userRow, draftCtx] = await Promise.all([
    db.query.users.findFirst({
      columns: { role: true },
      where: (u, { eq, and, isNull }) =>
        and(eq(u.id, userId), isNull(u.deletedAt)),
    }),
    getDraftAndVariantIds(userId),
  ]);

  if (!userRow) throw errorRes("Unauthorized", 401);
  if (!draftCtx.draft) throw errorRes("Draft order not found", 404);

  // Eligibility
  const eligible = await isEligible(
    discount.id,
    discount.eligibilityType,
    userId,
    userRow.role
  );
  if (!eligible) throw errorRes("Not eligible for this voucher", 400);

  // Filter variant yang diskon-able berdasarkan apply-scope
  const discountedVariantIds = await getDiscountedVariantIds(
    discount.apply,
    discount.id,
    draftCtx.variantIds
  );

  const itemsSelected = selectDiscountedItems(
    draftCtx.orderDraftItems,
    discountedVariantIds
  );

  const minViolation = getMinimumViolationMessage(discount, itemsSelected);
  if (minViolation) throw errorRes(minViolation, 400);

  // Cek batas pemakaian dengan COUNT(*) (lebih hemat)
  // Global cap
  if (discount.maxTotalUse) {
    const [{ cnt }] = await db
      .select({ cnt: sql<number>`count(*)` })
      .from(orders)
      .where(eq(orders.discountId, discount.id));
    if (cnt >= Number(discount.maxTotalUse))
      throw errorRes("Maximum usage reached", 400);
  }
  // Per user sekali
  if (discount.maxUserOnce) {
    const [{ cnt }] = await db
      .select({ cnt: sql<number>`count(*)` })
      .from(orders)
      .where(
        and(eq(orders.discountId, discount.id), eq(orders.userId, userId))
      );
    if (cnt > 0) throw errorRes("Maximum usage reached", 400);
  }

  const variantDiscounts = itemsSelected.map((variant) => {
    const price = n(variant.price) * n(variant.quantity);
    const discountPrice =
      discount.valueType === "percentage"
        ? Math.trunc((price * n(discount.value)) / 100)
        : n(discount.value);
    const finalPrice = price - discountPrice;
    return {
      variantId: variant.variantId,
      totalPriceBD: price,
      discountPrice,
      finalPrice,
    };
  });

  console.log(variantDiscounts);

  const totalDiscount = variantDiscounts.reduce(
    (sum, item) => sum + item.discountPrice,
    0
  );

  console.log(totalDiscount);

  // Tulis dalam transaksi (lebih aman jika nanti ada side-effect lain)
  await db.transaction(async (tx) => {
    const updateDraft = tx
      .update(orderDraft)
      .set({ discountId: discount.id, totalDiscount: String(totalDiscount) })
      .where(
        and(eq(orderDraft.userId, userId), eq(orderDraft.id, draftCtx.draft.id))
      );

    const updateItems = variantDiscounts.map((v) =>
      tx
        .update(orderDraftItems)
        .set({ discountPrice: v.discountPrice.toString() })
        .where(
          and(
            eq(orderDraftItems.orderDraftId, draftCtx.draft.id),
            eq(orderDraftItems.variantId, v.variantId)
          )
        )
    );

    await Promise.all([updateDraft, ...updateItems]);
  });
};

export const removeDiscount = async (userId: string) => {
  const removed = await db
    .update(orderDraft)
    .set({
      discountId: null,
      totalDiscount: null,
    })
    .where(eq(orderDraft.userId, userId));

  if (!removed) throw errorRes("Order draft not found", 404);
};

const n = (v: unknown) => {
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
};

function selectDiscountedItems(items: DraftItem[], variantIds: string[]) {
  if (variantIds.length === 0 || items.length === 0) return [];
  const set = new Set(variantIds);
  return items.filter((i) => set.has(i.variantId));
}

function getMinimumViolationMessage(
  discount: { minimumType?: string | null; minimum?: string | number | null },
  items: { price: string; quantity: string }[]
): string | null {
  if (!items.length) return "No discountable products found";
  if (discount.minimumType === "amount") {
    const total = items.reduce((a, it) => a + n(it.price) * n(it.quantity), 0);
    return n(discount.minimum ?? 0) > total
      ? "Minimum order price not met"
      : null;
  }
  if (discount.minimumType === "quantity") {
    const qty = items.reduce((a, it) => a + n(it.quantity), 0);
    return n(discount.minimum ?? 0) > qty
      ? "Minimum order quantity not met"
      : null;
  }
  return null;
}

// Helper: fetch draft + items untuk user (2 query ringan, terindeks)
async function getDraftAndVariantIds(userId: string) {
  const draft = await db.query.orderDraft.findFirst({
    columns: { id: true, totalPrice: true },
    where: (od, { eq }) => eq(od.userId, userId),
  });
  if (!draft)
    return {
      draft: null,
      orderDraftItems: [] as DraftItem[],
      variantIds: [] as string[],
    };

  const items = await db.query.orderDraftItems.findMany({
    columns: { variantId: true, quantity: true, price: true },
    where: (odi, { eq }) => eq(odi.orderDraftId, draft.id),
  });

  return {
    draft,
    orderDraftItems: items,
    variantIds: items.map((i) => i.variantId),
  };
}

// Helper: resolve variantIds yang eligible berdasarkan apply-scope, dibatasi hanya yang ada di draft
async function getDiscountedVariantIds(
  apply: ApplyType,
  discountId: string,
  draftVariantIds: string[]
): Promise<string[]> {
  if (draftVariantIds.length === 0) return [];

  // Scope: products (langsung via pivot variant)
  if (apply === "products") {
    const rows = await db.query.discountProductVariants.findMany({
      columns: { variantId: true },
      where: (dpv, { eq, inArray, and }) =>
        and(
          eq(dpv.discountId, discountId),
          inArray(dpv.variantId, draftVariantIds)
        ),
    });
    return rows.map((r) => r.variantId);
  }

  // Scope: categories
  if (apply === "categories") {
    const cats = await db.query.discountCategories.findMany({
      columns: { categoryId: true },
      where: (dc, { eq }) => eq(dc.discountId, discountId),
    });
    if (!cats.length) return [];
    const categoryIds = cats.map((c) => c.categoryId);

    const rows = await db
      .select({ variantId: productVariants.id })
      .from(productVariants)
      .innerJoin(
        products,
        and(
          eq(productVariants.productId, products.id),
          isNull(products.deletedAt)
        )
      )
      .where(
        and(
          inArray(products.categoryId, categoryIds),
          inArray(productVariants.id, draftVariantIds)
        )
      );

    return rows.map((r) => String(r.variantId));
  }

  // Scope: pets
  if (apply === "pets") {
    const pets = await db.query.discountPets.findMany({
      columns: { petId: true },
      where: (dp, { eq }) => eq(dp.discountId, discountId),
    });
    if (!pets.length) return [];
    const petIds = pets.map((p) => p.petId);

    const rows = await db
      .select({ variantId: productVariants.id })
      .from(productToPets)
      .innerJoin(
        products,
        and(
          eq(productToPets.productId, products.id),
          isNull(products.deletedAt)
        )
      )
      .innerJoin(productVariants, eq(productVariants.productId, products.id))
      .where(
        and(
          inArray(productToPets.petId, petIds),
          inArray(productVariants.id, draftVariantIds)
        )
      );

    return rows.map((r) => String(r.variantId));
  }

  // Scope: suppliers
  if (apply === "suppliers") {
    const sups = await db.query.discountSuppliers.findMany({
      columns: { supplierId: true },
      where: (ds, { eq }) => eq(ds.discountId, discountId),
    });
    if (!sups.length) return [];
    const supplierIds = sups.map((s) => s.supplierId);

    const rows = await db
      .select({ variantId: productVariants.id })
      .from(products)
      .innerJoin(productVariants, eq(productVariants.productId, products.id))
      .where(
        and(
          inArray(products.supplierId, supplierIds),
          inArray(productVariants.id, draftVariantIds),
          isNull(products.deletedAt)
        )
      );

    return rows.map((r) => String(r.variantId));
  }

  // Default: kalau ada jenis apply baru yang belum di-handle
  return draftVariantIds;
}

// Eligibility check yang efisien (pakai EXISTS)
async function isEligible(
  discountId: string,
  eligibilityType: "user" | "role" | null | undefined,
  userId: string,
  userRole: RoleType
) {
  if (!eligibilityType) return true;

  if (eligibilityType === "user") {
    const [{ ok }] = await db
      .select({
        ok: exists(
          db
            .select({ one: sql`1` })
            .from(discountUsers)
            .where(
              and(
                eq(discountUsers.discountId, discountId),
                eq(discountUsers.userId, userId)
              )
            )
        ),
      })
      .from(sql`(VALUES (1)) as _t(dummy)`); // trick untuk 1-row select
    return !!ok;
  }

  if (eligibilityType === "role") {
    const [{ ok }] = await db
      .select({
        ok: exists(
          db
            .select({ one: sql`1` })
            .from(discountToRoles)
            .where(
              and(
                eq(discountToRoles.discountId, discountId),
                eq(discountToRoles.role, userRole)
              )
            )
        ),
      })
      .from(sql`(VALUES (1)) as _t(dummy)`);
    return !!ok;
  }

  return true;
}
