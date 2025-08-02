import { r2Public } from "@/config";
import {
  productImages,
  db,
  products,
  productVariants,
  suppliers,
  categories,
} from "@/lib/db";
import { and, eq, exists, sql } from "drizzle-orm";

export const hompage = async () => {
  const trendingProducts = await db
    .select({
      id: products.id,
      title: products.name,
      slug: products.slug,
      description: products.description,
      image: productImages.url,
    })
    .from(products)
    .leftJoin(
      productImages,
      and(
        eq(productImages.productId, products.id),
        eq(
          productImages.id,
          sql`(
          SELECT id FROM product_images
          WHERE product_id = ${products.id}
          ORDER BY created_at ASC
          LIMIT 1
        )`
        )
      )
    )
    .where(
      and(
        exists(
          sql`(
        SELECT 1 FROM ${productVariants}
        WHERE ${productVariants.productId} = ${products.id}
          AND ${productVariants.stock} > 0
      )`
        ),
        eq(products.status, true)
      )
    )
    .orderBy(sql`RANDOM()`)
    .limit(4);

  const productsFormated = trendingProducts.map((item) => ({
    ...item,
    image: item.image ? `${r2Public}/${item.image}` : null,
  }));

  const suppliersHome = await db
    .select({
      id: suppliers.id,
      name: suppliers.name,
      slug: suppliers.slug,
      image: suppliers.image,
    })
    .from(suppliers)
    .orderBy(sql`RANDOM()`);

  const suppliersHomeFormat = suppliersHome.map((item) => ({
    ...item,
    image: item.image ? `${r2Public}/${item.image}` : null,
  }));

  const categoriesHome = await db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      image: categories.image,
    })
    .from(categories)
    .orderBy(sql`RANDOM()`)
    .limit(3);

  const categoriesHomeFormat = categoriesHome.map((item) => ({
    ...item,
    image: item.image ? `${r2Public}/${item.image}` : null,
  }));

  const response = {
    products: productsFormated,
    suppliers: suppliersHomeFormat,
    categories: categoriesHomeFormat,
  };

  return response;
};
