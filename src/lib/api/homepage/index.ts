import { r2Public } from "@/config";
import {
  productImages,
  db,
  products,
  productVariants,
  bannerItems,
  categories,
  pets,
  promos,
  suppliers,
  orders,
  orderItems,
  testimonies,
  testimoniProduct,
} from "@/lib/db";
import { and, eq, exists, inArray, isNull, sql } from "drizzle-orm";

// 🔹 helper format image
const formatImage = (image: string | null) =>
  image ? `${r2Public}/${image}` : null;

export const hompage = async () => {
  const now = new Date();

  const [
    trendingProductsRaw,
    suppliersHomeRaw,
    categoriesHomeRaw,
    bannersHomeRaw,
    promosHomeRaw,
  ] = await Promise.all([
    // 🔹 Trending Products
    db
      .select({
        title: products.name,
        slug: products.slug,
        description: products.description,
        image: sql`
          (SELECT ${productImages.url} 
          FROM ${productImages} 
          WHERE ${productImages.productId} = ${products.id} 
          ORDER BY ${productImages.position} ASC 
          LIMIT 1)`.as("image"),
        totalSold:
          sql<number>`COALESCE(ROUND(SUM(${orderItems.quantity})::numeric, 0), 0)`.as(
            "total_sold"
          ),
        avgRating:
          sql<number>`COALESCE(ROUND(AVG(${testimonies.rating})::numeric, 0), 0)`.as(
            "avg_rating"
          ),
      })
      .from(products)
      // 🔹 join ke product_variants → order_items
      .leftJoin(productVariants, eq(productVariants.productId, products.id))
      .leftJoin(orderItems, eq(orderItems.variantId, productVariants.id))
      // 🔹 join ke testimonies lewat testimoniProduct
      .leftJoin(testimoniProduct, eq(testimoniProduct.productId, products.id))
      .leftJoin(testimonies, eq(testimonies.id, testimoniProduct.testimoniId))
      .where(
        and(
          exists(
            sql`(
        SELECT 1 FROM ${productVariants}
        WHERE ${productVariants.productId} = ${products.id}
          AND ${productVariants.stock} > 0
      )`
          ),
          eq(products.status, true),
          isNull(products.deletedAt)
        )
      )
      .groupBy(products.id)
      .orderBy(sql`RANDOM()`)
      .limit(4),

    // 🔹 Suppliers
    db.query.suppliers.findMany({
      columns: { name: true, slug: true, image: true },
      orderBy: sql`RANDOM()`,
      limit: 3,
    }),

    // 🔹 Categories
    db.query.categories.findMany({
      columns: { name: true, slug: true, image: true },
      orderBy: sql`RANDOM()`,
      limit: 3,
    }),

    // 🔹 Banners
    db.query.banners.findMany({
      columns: { id: true, name: true, image: true, type: true },
      where: (b, { lte, gte, or, isNull }) =>
        and(lte(b.startAt, now), or(isNull(b.endAt), gte(b.endAt, now))),
      orderBy: sql`RANDOM()`,
    }),

    // 🔹 Promos
    db.query.promos.findMany({
      columns: { name: true, slug: true, image: true },
      orderBy: sql`RANDOM()`,
      where: (b, { lte, gte, or, isNull }) =>
        and(lte(b.startAt, now), or(isNull(b.endAt), gte(b.endAt, now))),
    }),
  ]);

  // 🔹 Map bannerIds & bannerItems
  const bannerIds = bannersHomeRaw.map((b) => b.id);
  const bannerItemsHome = bannerIds.length
    ? await db
        .select({
          bannerId: bannerItems.bannerId,
          categoryName: categories.name,
          categorySlug: categories.slug,
          petName: pets.name,
          petSlug: pets.slug,
          productName: products.name,
          productSlug: products.slug,
          promoName: promos.name,
          promoSlug: promos.slug,
          supplierName: suppliers.name,
          supplierSlug: suppliers.slug,
        })
        .from(bannerItems)
        .leftJoin(categories, eq(categories.id, bannerItems.categoryId))
        .leftJoin(suppliers, eq(suppliers.id, bannerItems.supplierId))
        .leftJoin(pets, eq(pets.id, bannerItems.petId))
        .leftJoin(
          products,
          and(
            eq(products.id, bannerItems.productId),
            isNull(products.deletedAt)
          )
        )
        .leftJoin(promos, eq(promos.id, bannerItems.promoId))
        .where(inArray(bannerItems.bannerId, bannerIds))
    : [];

  // 🔹 Format banners
  const bannersHomeFormat = bannersHomeRaw.map((item) => ({
    name: item.name,
    type: item.type,
    image: formatImage(item.image),
    target: bannerItemsHome
      .filter((b) => b.bannerId === item.id)
      .map((i) => {
        switch (item.type) {
          case "CATEGORIES":
            return { name: i.categoryName, slug: i.categorySlug };
          case "DETAIL":
            return { name: i.productSlug, slug: i.productSlug };
          case "PETS":
            return { name: i.petSlug, slug: i.petSlug };
          case "PROMOS":
            return { name: i.promoSlug, slug: i.promoSlug };
          case "SUPPLIERS":
            return { name: i.supplierName, slug: i.supplierSlug };
        }
      }),
  }));

  return {
    products: trendingProductsRaw.map((p) => ({
      ...p,
      image: formatImage(p.image as string),
    })),
    suppliers: suppliersHomeRaw.map((s) => ({
      ...s,
      image: formatImage(s.image),
    })),
    categories: categoriesHomeRaw.map((c) => ({
      ...c,
      image: formatImage(c.image),
    })),
    banners: bannersHomeFormat,
    promos: promosHomeRaw.map((p) => ({ ...p, image: formatImage(p.image) })),
  };
};
