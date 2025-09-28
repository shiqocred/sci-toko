import { r2Public } from "@/config";
import { errorRes } from "@/lib/auth";
import { db, testimonies, testimoniImage, testimoniProduct } from "@/lib/db";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { and, eq, sql } from "drizzle-orm";

export const productReviews = async (
  params: Promise<{ productId: string }>
) => {
  const { productId: productSlug } = await params;
  if (!productSlug) throw errorRes("Product slug is required", 422);
  const slugFormatted = decodeURIComponent(productSlug);

  const productExist = await db.query.products.findFirst({
    where: (p, { eq, and, isNull }) =>
      and(eq(p.slug, slugFormatted), isNull(p.deletedAt)),
  });

  if (!productExist) throw errorRes("Product not found", 404);

  const reviews = await db
    .select({
      title: testimonies.title,
      timestamp: testimonies.createdAt,
      rating: testimonies.rating,
      description: testimonies.message,
      images: sql<string[]>`
        COALESCE(array_agg(${testimoniImage.url}) FILTER (WHERE ${testimoniImage.url} IS NOT NULL), '{}')
      `,
    })
    .from(testimonies)
    .leftJoin(testimoniImage, eq(testimoniImage.testimoniId, testimonies.id))
    .leftJoin(
      testimoniProduct,
      eq(testimoniProduct.testimoniId, testimonies.id)
    )
    .where(
      and(
        eq(testimoniProduct.productId, productExist.id),
        eq(testimonies.isActive, true)
      )
    )
    .groupBy(testimonies.id);

  return reviews.map((review) => ({
    ...review,
    rating: Number(review.rating),
    timestamp: format(review.timestamp, "PP", { locale: id }),
    images:
      review.images.length > 0
        ? review.images.map((i) => `${r2Public}/${i}`)
        : [],
  }));
};
