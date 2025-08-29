import { r2Public } from "@/config";
import { errorRes } from "@/lib/auth";
import {
  categories,
  db,
  pets,
  productAvailableRoles,
  productImages,
  products,
  productToPets,
  productVariants,
  suppliers,
} from "@/lib/db";
import {
  and,
  desc,
  eq,
  exists,
  InferSelectModel,
  isNull,
  sql,
} from "drizzle-orm";

type RoleType = InferSelectModel<typeof productAvailableRoles>["role"];

export const productDetail = async (
  params: Promise<{ productId: string }>,
  userId?: string
) => {
  const { productId: productSlug } = await params;
  if (!productSlug) throw errorRes("Product not found", 404);
  const slugFormatted = decodeURIComponent(productSlug);

  // Ambil produk utama
  const [productExist] = await db
    .select({
      id: products.id,
      name: products.name,
      description: products.description,
      dosageUsage: products.dosageUsage,
      indication: products.indication,
      packaging: products.packaging,
      registrationNumber: products.registrationNumber,
      storageInstruction: products.storageInstruction,
      supplierName: suppliers.name,
      supplierSlug: suppliers.slug,
      categoryName: categories.name,
      categorySlug: categories.slug,
    })
    .from(products)
    .leftJoin(categories, eq(categories.id, products.categoryId))
    .leftJoin(suppliers, eq(suppliers.id, products.supplierId))
    .where(
      and(
        eq(products.slug, slugFormatted),
        eq(products.status, true),
        isNull(products.deletedAt),
        exists(
          sql`(
        SELECT 1 FROM ${productVariants}
        WHERE ${productVariants.productId} = ${products.id}
          AND ${productVariants.stock} > 0
      )`
        )
      )
    );

  if (!productExist) throw errorRes("Product not found", 404);

  // Jalankan semua query paralel
  const [compositions, imagesRaw, petsRaw, variantsRaw, availableRaw] =
    await Promise.all([
      db.query.productCompositions.findMany({
        columns: { name: true, value: true },
        where: (c, { eq }) => eq(c.productId, productExist.id),
      }),
      db.query.productImages.findMany({
        columns: { url: true },
        where: (c, { eq }) => eq(c.productId, productExist.id),
        orderBy: desc(productImages.position),
      }),
      db
        .select({ name: pets.name, slug: pets.slug })
        .from(productToPets)
        .leftJoin(pets, eq(pets.id, productToPets.petId))
        .where(eq(productToPets.productId, productExist.id)),
      db
        .select({
          id: productVariants.id,
          name: productVariants.name,
          is_default: productVariants.isDefault,
          price: productVariants.price,
          stock: productVariants.stock,
          weight: productVariants.weight,
        })
        .from(productVariants)
        .where(eq(productVariants.productId, productExist.id)),
      db.query.productAvailableRoles.findMany({
        where: (pa, { eq }) => eq(pa.productId, productExist.id),
      }),
    ]);

  const variantIds = variantsRaw.map((v) => v.id);

  // Ambil user role & cart sekaligus jika ada userId
  let userRole: RoleType | undefined;
  const cartMap: Map<string, string> = new Map();

  if (userId && variantIds.length > 0) {
    const [user, carts] = await Promise.all([
      db.query.users.findFirst({ where: (u, { eq }) => eq(u.id, userId) }),
      db.query.carts.findMany({
        columns: { variantId: true, quantity: true },
        where: (c, { eq, and, inArray }) =>
          and(eq(c.userId, userId), inArray(c.variantId, variantIds)),
      }),
    ]);
    userRole = user?.role;
    carts.forEach((c) => cartMap.set(c.variantId, c.quantity));
  }

  const available = availableRaw.some((i) => i.role === userRole);

  const images = imagesRaw.map((i) => `${r2Public}/${i.url}`);

  // Ambil semua harga variant
  const pricingRaw = await db.query.productVariantPrices.findMany({
    where: (pp, { inArray }) => inArray(pp.variantId, variantIds),
  });

  // Map harga per variantId
  const pricingMap: Map<string, Map<RoleType, string>> = new Map();
  pricingRaw.forEach((p) => {
    if (!pricingMap.has(p.variantId)) pricingMap.set(p.variantId, new Map());
    pricingMap.get(p.variantId)!.set(p.role, p.price);
  });

  const getPrice = (variantId: string) => {
    const priceByRole = pricingMap.get(variantId);
    if (!priceByRole) return "0";

    if (userRole && priceByRole.has(userRole))
      return priceByRole.get(userRole)!;
    return priceByRole.get("BASIC") ?? "0";
  };

  // Map variants dengan harga, diskon, dan jumlah cart
  const allVariants = variantsRaw.map((v) => {
    const newPrice = getPrice(v.id);
    const oldPrice = v.price;
    const discount =
      oldPrice === "0"
        ? 0
        : ((Number(oldPrice) - Number(newPrice)) / Number(oldPrice)) * 100;
    return {
      id: v.id,
      name: v.name,
      old_price: oldPrice,
      new_price: newPrice,
      stock: v.stock,
      weight: v.weight,
      discount: discount.toFixed(0),
      in_cart: cartMap.get(v.id) ?? "0",
      is_default: v.is_default,
    };
  });

  const defaultVariant = allVariants.find((v) => v.is_default) || null;
  const variants = allVariants.filter((v) => !v.is_default);

  // Hitung range harga & diskon rata-rata
  const oldPrices = allVariants.map((v) => Number(v.old_price));
  const newPrices = allVariants.map((v) => Number(v.new_price));
  const discounts = allVariants.map((v) => Number(v.discount));

  const getRange = (prices: number[]) => {
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return min === max ? [String(min)] : [String(min), String(max)];
  };

  const data_variant = {
    oldPrice: getRange(oldPrices),
    newPrice: getRange(newPrices),
    discount: discounts.length
      ? (discounts.reduce((a, b) => a + b, 0) / discounts.length).toFixed(0)
      : "0",
  };

  return {
    name: productExist.name,
    description: productExist.description,
    indication: productExist.indication,
    dosage_usage: productExist.dosageUsage,
    packaging: productExist.packaging,
    registration_number: productExist.registrationNumber,
    storage_instruction: productExist.storageInstruction,
    available,
    availableFor: availableRaw.map((i) => i.role),
    supplier: {
      name: productExist.supplierName,
      slug: productExist.supplierSlug,
    },
    category: {
      name: productExist.categoryName,
      slug: productExist.categorySlug,
    },
    compositions,
    images,
    pets: petsRaw,
    data_variant,
    variants: variants.length ? variants : null,
    default_variant: defaultVariant,
  };
};
