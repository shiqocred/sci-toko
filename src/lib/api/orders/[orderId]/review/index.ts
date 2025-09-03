import { r2Public } from "@/config";
import { errorRes } from "@/lib/auth";
import { convertToWebP } from "@/lib/convert-image";
import {
  db,
  orderItems,
  productVariants,
  testimonies,
  testimoniImage,
  testimoniProduct,
} from "@/lib/db";
import { uploadToR2 } from "@/lib/providers";
import { createId } from "@paralleldrive/cuid2";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import slugify from "slugify";
import { z } from "zod/v4";

const reviewSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  rating: z
    .number()
    .gte(1, { message: "Minimum 1 star" })
    .lte(5, { message: "Maximum 5 stars" }),
  description: z.string().min(1, { message: "Description is required" }),
});

export const getReview = async (userId: string, orderId: string) => {
  const testimoniesExist = await db.query.testimonies.findFirst({
    where: (t, { eq, and }) =>
      and(eq(t.orderId, orderId), eq(t.userId, userId)),
  });

  if (!testimoniesExist) return null;

  const images = await db.query.testimoniImage.findMany({
    where: (ti, { eq }) => eq(ti.testimoniId, testimoniesExist.id),
  });

  const response = {
    title: testimoniesExist.title,
    rating: Number(testimoniesExist.rating),
    description: testimoniesExist.message,
    images: images.map((i) => `${r2Public}/${i.url}`),
    timestamp: testimoniesExist.createdAt
      ? format(testimoniesExist.createdAt, "PPP HH:mm", { locale: id })
      : null,
  };

  return response;
};

export const submitReview = async (
  req: NextRequest,
  userId: string,
  orderId: string
) => {
  const formData = await req.formData();

  const body = {
    title: formData.get("title"),
    rating: Number(formData.get("rating")),
    description: formData.get("description"),
  };

  const result = reviewSchema.safeParse(body);

  if (!result.success) {
    const errors = Object.fromEntries(
      result.error.issues.map((err) => [err.path.join("."), err.message])
    );
    throw errorRes("Validation failed", 422, errors);
  }

  const { title, description, rating } = result.data;

  const images = formData.getAll("images") as File[];
  const uploadedKeys: string[] = [];

  // Upload images
  for (const image of images) {
    const buffer = await convertToWebP(image);
    const key = `images/testimonies/${slugify(title, { lower: true })}/${createId()}.webp`;
    await uploadToR2({ buffer, key });
    uploadedKeys.push(key);
  }

  const productExist = await db
    .selectDistinct({ productId: productVariants.productId })
    .from(orderItems)
    .leftJoin(productVariants, eq(productVariants.id, orderItems.variantId))
    .where(eq(orderItems.orderId, orderId));

  const productIds = productExist.map((i) => i.productId as string);

  const testimoniId = createId();

  await db.transaction(async (tx) => {
    await tx.insert(testimonies).values({
      id: testimoniId,
      title,
      message: description,
      rating: rating.toString(),
      orderId,
      userId,
    });

    if (uploadedKeys.length > 0) {
      await Promise.all([
        tx.insert(testimoniImage).values(
          uploadedKeys.map((url) => ({
            testimoniId,
            url,
          }))
        ),
        tx
          .insert(testimoniProduct)
          .values(productIds.map((i) => ({ testimoniId, productId: i }))),
      ]);
    } else {
      await tx
        .insert(testimoniProduct)
        .values(productIds.map((i) => ({ testimoniId, productId: i })));
    }
  });
};
