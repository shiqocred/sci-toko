import { r2Public } from "@/config";
import { db, productVariants } from "@/lib/db";
import { sql } from "drizzle-orm";

export type MetadataProductDetailProps = {
  status: boolean;
  message: string;
  data: {
    name: string;
    description: string;
    image: string | null;
  } | null;
};

export const metadataProductDetail = async (
  productSlug: string
): Promise<MetadataProductDetailProps> => {
  if (!productSlug)
    return {
      status: false,
      message: "Product slug is required",
      data: null,
    };

  const productExist = await db.query.products.findFirst({
    columns: { id: true, name: true, description: true },
    where: (p, { eq, and, exists }) =>
      and(
        eq(p.slug, productSlug),
        exists(
          db
            .select()
            .from(productVariants)
            .where(
              and(
                eq(productVariants.productId, p.id),
                sql`${productVariants.stock} > 0`
              )
            )
        ),
        eq(p.status, true)
      ),
  });

  if (!productExist)
    return {
      status: false,
      message: "Product not found",
      data: null,
    };

  const productImage = await db.query.productImages.findFirst({
    columns: { url: true },
    where: (pi, { eq }) => eq(pi.productId, productExist.id),
    orderBy: (pi, { asc }) => asc(pi.createdAt),
  });

  return {
    status: true,
    message: "Retrieve Product",
    data: {
      name: productExist.name,
      description: productExist.description as string,
      image: productImage?.url ? `${r2Public}/${productImage?.url}` : null,
    },
  };
};
