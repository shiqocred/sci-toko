import { r2Public } from "@/config";
import {
  categories,
  db,
  productImages,
  products,
  productToPets,
  productVariants,
  promoItems,
  suppliers,
} from "@/lib/db";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { NextRequest } from "next/server";

export const productsList = async (req: NextRequest) => {
  const now = new Date();
  const searchParams = req.nextUrl.searchParams;
  const q = searchParams.get("q") ?? "";

  const getSlugs = (key: string) =>
    searchParams.getAll(key).map(decodeURIComponent);

  const [categorySlugs, supplierSlugs, petSlugs, promoSlugs] = [
    getSlugs("categories"),
    getSlugs("suppliers"),
    getSlugs("pets"),
    getSlugs("promos"),
  ];

  const [categoriesRes, suppliersRes, petsRes, promoRes] = await Promise.all([
    categorySlugs.length
      ? db.query.categories.findMany({
          columns: { id: true },
          where: (c, { inArray }) => inArray(c.slug, categorySlugs),
        })
      : Promise.resolve([]),
    supplierSlugs.length
      ? db.query.suppliers.findMany({
          columns: { id: true },
          where: (s, { inArray }) => inArray(s.slug, supplierSlugs),
        })
      : Promise.resolve([]),
    petSlugs.length
      ? db.query.pets.findMany({
          columns: { id: true },
          where: (p, { inArray }) => inArray(p.slug, petSlugs),
        })
      : Promise.resolve([]),
    promoSlugs.length
      ? db.query.promos.findMany({
          columns: { id: true },
          where: (p, { inArray, and, or, lte, gte, isNull }) =>
            and(
              inArray(p.slug, promoSlugs),
              lte(p.startAt, now),
              or(isNull(p.endAt), gte(p.endAt, now))
            ),
        })
      : Promise.resolve([]),
  ]);

  const categoryIds = categoriesRes.map((c) => c.id);
  const supplierIds = suppliersRes.map((s) => s.id);
  const petIds = petsRes.map((p) => p.id);
  const promoIds = promoRes.map((p) => p.id);

  const filters = [
    eq(products.status, true),
    sql`EXISTS (
      SELECT 1 FROM ${productVariants}
      WHERE ${productVariants.productId} = ${products.id}
      AND ${productVariants.stock} > 0
    )`,
  ];

  if (q) {
    filters.push(
      sql`(${products.name} ILIKE ${`%${q}%`} OR ${products.slug} ILIKE ${`%${q}%`})`
    );
  }
  if (categoryIds.length) {
    filters.push(inArray(products.categoryId, categoryIds));
  }
  if (supplierIds.length) {
    filters.push(inArray(products.supplierId, supplierIds));
  }
  if (petIds.length) {
    filters.push(inArray(productToPets.petId, petIds));
  }
  if (promoIds.length) {
    filters.push(inArray(promoItems.promoId, promoIds));
  }

  const finalWhere = and(...filters);

  const page = Number(searchParams.get("p") ?? 1);
  const perPage = 12;
  const offset = (page - 1) * perPage;

  const totalQuery = await db
    .select({ count: sql<number>`COUNT(DISTINCT ${products.id})` })
    .from(products)
    .leftJoin(productToPets, eq(products.id, productToPets.productId))
    .leftJoin(promoItems, eq(products.id, promoItems.productId))
    .where(finalWhere);

  const total = totalQuery[0]?.count ?? 0;

  const productsList = await db
    .select({
      title: products.name,
      slug: products.slug,
      description: products.description,
      image: sql`
        (SELECT ${productImages.url} 
         FROM ${productImages} 
         WHERE ${productImages.productId} = ${products.id} 
         ORDER BY ${productImages.createdAt} ASC 
         LIMIT 1)`.as("image"),
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(suppliers, eq(products.supplierId, suppliers.id))
    .leftJoin(productToPets, eq(products.id, productToPets.productId))
    .leftJoin(promoItems, eq(products.id, promoItems.productId))
    .where(finalWhere)
    .groupBy(products.id)
    .orderBy(desc(products.createdAt))
    .limit(perPage)
    .offset(offset);

  return {
    data: productsList.map((item) => ({
      ...item,
      image: item.image ? `${r2Public}/${item.image as string}` : null,
    })),
    pagination: {
      total,
      page,
      totalPages: Math.ceil(total / perPage),
    },
  };
};
