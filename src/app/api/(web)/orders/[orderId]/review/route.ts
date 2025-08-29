import { auth, errorRes, successRes } from "@/lib/auth";
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
import { isResponse } from "@/lib/utils";
import { createId } from "@paralleldrive/cuid2";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import { z } from "zod/v4";
import slugify from "slugify";
import { r2Public } from "@/config";
import { format } from "date-fns";
import { id } from "date-fns/locale";

const reviewSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  rating: z
    .number()
    .gte(1, { message: "Minimum 1 star" })
    .lte(5, { message: "Maximum 5 stars" }),
  description: z.string().min(1, { message: "Description is required" }),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const session = await auth();
    if (!session) return errorRes("Unauthorized", 401);

    const userId = session.user.id;

    const testimoniesExist = await db.query.testimonies.findFirst({
      where: (t, { eq, and }) =>
        and(eq(t.orderId, orderId), eq(t.userId, userId)),
    });

    if (!testimoniesExist) return successRes(null, "Retrieve testimoni");

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

    return successRes(response, "Retrieve testimoni");
  } catch (error) {
    if (isResponse(error)) return error;
    console.error("ERROR_GET_REVIEW_ORDER", error);
    return errorRes("Internal Server Error", 500);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const session = await auth();
    if (!session) return errorRes("Unauthorized", 401);

    const userId = session.user.id;

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
      return errorRes("Validation failed", 422, errors);
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

    return successRes({ orderId }, "Review submitted");
  } catch (error) {
    if (isResponse(error)) return error;
    console.error("ERROR_SUBMIT_REVIEW_ORDER", error);
    return errorRes("Internal Server Error", 500);
  }
}
