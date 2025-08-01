import { r2Public } from "@/config";
import { auth, errorRes, successRes } from "@/lib/auth";
import {
  categories,
  db,
  pets,
  productImages,
  products,
  productToPets,
  productVariants,
  suppliers,
} from "@/lib/db";
import { desc, eq } from "drizzle-orm";
import { NextRequest } from "next/server";

interface VariantProps {
  name: string;
  is_default: boolean | null;
  normal_price: string;
  basic_price: string | null;
  petShop_price: string | null;
  doctor_price: string | null;
  stock: string | null;
  weight: string | null;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const isAuth = await auth();
    const userRole = isAuth?.user.role ?? "BASIC";
    const { productId: productSlug } = await params;

    const userId = isAuth?.user.id;

    if (!productSlug) return errorRes("Product not found", 404);

    const slugFormatted = decodeURIComponent(productSlug);

    // 1. Ambil data produk utama dengan join
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
      .where(eq(products.slug, slugFormatted));

    if (!productExist) return errorRes("Product not found", 404);

    // 2. Jalankan semua query paralel
    const [compositions, imagesRaw, petsRaw, variantsRaw] = await Promise.all([
      db.query.productCompositions.findMany({
        columns: { name: true, value: true },
        where: (c, { eq }) => eq(c.productId, productExist.id),
      }),
      db.query.productImages.findMany({
        columns: { url: true },
        where: (c, { eq }) => eq(c.productId, productExist.id),
        orderBy: desc(productImages.createdAt),
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
          normal_price: productVariants.normalPrice,
          basic_price: productVariants.basicPrice,
          petShop_price: productVariants.petShopPrice,
          doctor_price: productVariants.doctorPrice,
          stock: productVariants.stock,
          weight: productVariants.weight,
        })
        .from(productVariants)
        .where(eq(productVariants.productId, productExist.id)),
    ]);

    let cartsRaw: {
      variantId: string;
      quantity: string;
    }[] = [];

    if (userId && variantsRaw.length > 0) {
      const variantIds = variantsRaw.map((item) => item.id);
      cartsRaw = await db.query.carts.findMany({
        columns: { variantId: true, quantity: true },
        where: (c, { eq, and, inArray }) =>
          and(eq(c.userId, userId), inArray(c.variantId, variantIds)),
      });
    }

    // 3. Format data
    const images =
      imagesRaw.length > 0
        ? imagesRaw.map((item) => `${r2Public}/${item.url}`)
        : [];

    const getPriceByRole = (item: VariantProps): string => {
      if (userRole === "VETERINARIAN") return item.doctor_price || "0";
      if (userRole === "PETSHOP") return item.petShop_price || "0";
      return item.basic_price || "0";
    };

    const variants = variantsRaw.map((item) => {
      const newPrice = getPriceByRole(item);
      const oldPrice = item.normal_price;
      const discount =
        oldPrice === "0"
          ? 0
          : ((Number(oldPrice) - Number(newPrice)) / Number(oldPrice)) * 100;

      return {
        id: item.id,
        name: item.name,
        old_price: oldPrice,
        new_price: newPrice,
        stock: item.stock,
        weight: item.weight,
        discount: discount.toFixed(0),
        in_cart: cartsRaw.find((c) => c.variantId === item.id)?.quantity ?? "0",
      };
    });

    const defaultVariant = variantsRaw.find((v) => v.is_default);
    const hasDefault = !!defaultVariant;

    const default_variant = hasDefault
      ? {
          id: defaultVariant.id,
          old_price: defaultVariant.normal_price,
          new_price: getPriceByRole(defaultVariant),
          stock: defaultVariant.stock,
          weight: defaultVariant.weight,
          in_cart:
            cartsRaw.find((c) => c.variantId === defaultVariant.id)?.quantity ??
            "0",
        }
      : null;

    const nonDefaultVariants = hasDefault
      ? variants.filter((v) => v.id !== defaultVariant.id)
      : variants;

    // 4. Hitung range harga & diskon rata-rata
    const oldPrices = variants.map((v) => Number(v.old_price));
    const newPrices = variants.map((v) => Number(v.new_price));

    function getRange(prices: number[]): [string] | [string, string] {
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      return min === max ? [String(min)] : [String(min), String(max)];
    }

    const discounts = variants.map((v) => {
      const oldPrice = Number(v.old_price);
      const newPrice = Number(v.new_price);
      return oldPrice === 0 ? 0 : ((oldPrice - newPrice) / oldPrice) * 100;
    });

    const avgDiscount =
      discounts.length > 0
        ? (discounts.reduce((sum, d) => sum + d, 0) / discounts.length).toFixed(
            0
          )
        : "0";

    const data_variant = {
      oldPrice: getRange(oldPrices),
      newPrice: getRange(newPrices),
      discount: avgDiscount,
    };

    // 5. Response akhir
    const response = {
      name: productExist.name,
      description: productExist.description,
      indication: productExist.indication,
      dosage_usage: productExist.dosageUsage,
      packaging: productExist.packaging,
      registration_number: productExist.registrationNumber,
      storage_instruction: productExist.storageInstruction,
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
      variants: nonDefaultVariants.length > 0 ? nonDefaultVariants : null,
      default_variant,
    };

    return successRes(response, "Product detail");
  } catch (error) {
    console.error("ERROR_GET_PRODUCT", error);
    return errorRes("Internal Error", 500);
  }
}
