// components/product/ProductInfo.tsx
"use client";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { StarIcon, Tag, PawPrint } from "lucide-react";
import { ProductDetailProps } from "../../_api";
import Link from "next/link";
import { CartAction } from "./_sub-sections/action";
import { formatRupiah } from "@/lib/utils";

// Props for the ProductInfo component
interface ProductInfoProps {
  product: ProductDetailProps;
  status: "authenticated" | "loading" | "unauthenticated";
}

export const ProductInfo = ({ product, status }: ProductInfoProps) => {
  const oldPrice = product.data_variant.oldPrice
    .map((i) => formatRupiah(i))
    .join(" - ");
  const newPrice = product.data_variant.newPrice
    .map((i) => formatRupiah(i))
    .join(" - ");

  const isSame = oldPrice === newPrice;

  const price = (type: "old" | "new") => {
    if (type === "new") {
      return product.data_variant.newPrice
        .map((i) => formatRupiah(i))
        .join(" - ");
    } else {
      if (isSame) {
        return null;
      } else {
        return product.data_variant.oldPrice
          .map((i) => formatRupiah(i))
          .join(" - ");
      }
    }
  };
  return (
    <div className="w-full flex flex-col order-2 lg:order-3">
      <div className="flex flex-col gap-4 bg-white shadow rounded-lg p-5 ">
        <div className="flex flex-col gap-2">
          <div className="flex flex-col md:hidden gap-2 text-red-500">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <p className="text-xl font-bold">{price("new")}</p>
                {!isSame && (
                  <Badge className="py-0 px-1 rounded-sm text-[10px] font-bold text-white bg-red-500">
                    -{product.data_variant.discount}%
                  </Badge>
                )}
              </div>
              {product.isAvailable && (
                <div className="flex items-center gap-2">
                  <p className="text-sm text-gray-500 line-through">
                    {price("old")}
                  </p>
                </div>
              )}
            </div>
            <Separator className="bg-gray-500" />
          </div>
          <h2 className="text-lg md:text-2xl font-semibold md:font-bold">
            {product?.name}
          </h2>
          <div className="flex items-center gap-3">
            <StarIcon className="size-4 fill-yellow-400 text-transparent" />
            <div className="flex items-center text-xs gap-2 text-gray-500">
              <span>{(product.avg_rating ?? 0).toLocaleString()}</span>
              <span className="h-4 w-px bg-gray-500" />
              <span>{(product.total_orders ?? 0).toLocaleString()} Sold</span>
            </div>
          </div>
          <div className="flex items-center flex-wrap gap-2">
            <Badge
              variant={"outline"}
              className="px-3 py-1 rounded border-gray-500 text-gray-500 gap-2"
              asChild
            >
              <Link href={`/products?categories=${product?.category.slug}`}>
                <Tag />
                {product?.category.name}
              </Link>
            </Badge>
            {product?.pets.map((item) => (
              <Badge
                key={item.name}
                variant={"outline"}
                className="px-3 py-1 rounded border-gray-500 text-gray-500 gap-2"
                asChild
              >
                <Link href={`/products?pets=${item.slug}`}>
                  <PawPrint />
                  {item.name}
                </Link>
              </Badge>
            ))}
          </div>
        </div>
        <div className="md:flex flex-col hidden">
          <Separator className="bg-gray-500" />
          <CartAction status={status} product={product} />
        </div>
      </div>
    </div>
  );
};
