import { r2Public } from "@/config";
import { errorRes, successRes } from "@/lib/auth";
import { categories, db, productImages, products, suppliers } from "@/lib/db";
import { and, eq, sql } from "drizzle-orm";

export async function GET() {
  try {
    const trendingProducts = await db
      .select({
        id: products.id,
        title: products.name,
        slug: products.slug,
        description: products.description,
        image: productImages.url, // ambil gambar pertama
      })
      .from(products)
      .leftJoin(
        productImages,
        and(
          eq(productImages.productId, products.id),
          // Ambil hanya satu image: gambar pertama (misalnya berdasarkan waktu dibuat)
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

    const response = {
      products: productsFormated,
      suppliers: suppliersHomeFormat,
      categories: categoriesHome,
    };

    return successRes(response, "Homepage data");
  } catch (error) {
    console.log("ERROR_GET_HOMEPAGE", error);
    return errorRes("Internal Error", 500);
  }
}
