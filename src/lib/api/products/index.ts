import { r2Public } from "@/config";
import {
  categories,
  db,
  productImages,
  products,
  productToPets,
  productVariants,
  suppliers,
} from "@/lib/db";
import { and, desc, eq, ilike, inArray, sql, SQL } from "drizzle-orm";
import { NextRequest } from "next/server";

export const productsList = async (req: NextRequest) => {
  const q = req.nextUrl.searchParams.get("q") ?? "";

  const categorySlugs = req.nextUrl.searchParams
    .getAll("categories")
    .filter(Boolean)
    .map(decodeURIComponent);
  const supplierSlugs = req.nextUrl.searchParams
    .getAll("suppliers")
    .filter(Boolean)
    .map(decodeURIComponent);
  const petSlugs = req.nextUrl.searchParams
    .getAll("pets")
    .filter(Boolean)
    .map(decodeURIComponent);

  const categoriesRes = await db.query.categories.findMany({
    columns: { id: true },
    where: (c, { inArray }) => inArray(c.slug, categorySlugs),
  });
  const categoryIds = categoriesRes.map((c) => c.id);

  const suppliersRes = await db.query.suppliers.findMany({
    columns: { id: true },
    where: (s, { inArray }) => inArray(s.slug, supplierSlugs),
  });
  const supplierIds = suppliersRes.map((s) => s.id);

  const petsRes = await db.query.pets.findMany({
    columns: { id: true },
    where: (p, { inArray }) => inArray(p.slug, petSlugs),
  });
  const petIds = petsRes.map((p) => p.id);

  const filters: SQL[] = [];

  if (q) {
    const query = sql.join(
      [ilike(products.name, `%${q}%`), ilike(products.slug, `%${q}%`)],
      sql` OR `
    );
    filters.push(query);
  }

  if (categoryIds.length)
    filters.push(inArray(products.categoryId, categoryIds));

  if (supplierIds.length)
    filters.push(inArray(products.supplierId, supplierIds));

  if (petIds.length) filters.push(inArray(productToPets.petId, petIds));

  filters.push(eq(products.status, true));
  filters.push(sql`
      EXISTS (
        SELECT 1 FROM ${productVariants}
        WHERE ${productVariants.productId} = ${products.id}
        AND ${productVariants.stock} > 0
      )
    `);

  const finalWhere = filters.length ? and(...filters) : undefined;

  const page = parseInt(req.nextUrl.searchParams.get("p") ?? "1");
  const perPage = 12;
  const offset = (page - 1) * perPage;

  const totalQuery = await db
    .select({ count: sql<number>`COUNT(DISTINCT ${products.id})` })
    .from(products)
    .leftJoin(productToPets, eq(products.id, productToPets.productId))
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
    .where(finalWhere)
    .groupBy(products.id, categories.name, suppliers.name)
    .orderBy(desc(products.createdAt))
    .limit(perPage)
    .offset(offset);

  const formatted = productsList.map((item) => ({
    ...item,
    image: item.image ? `${r2Public}/${item.image as string}` : null,
  }));

  const totalPages = Math.ceil(total / perPage);

  const response = {
    data: formatted,
    pagination: {
      total: Number(total),
      page,
      totalPages,
    },
  };

  return response;
};
