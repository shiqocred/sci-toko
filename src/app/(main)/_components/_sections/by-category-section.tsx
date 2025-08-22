import { Heading } from "@/components/heading";
import { sizesImage } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { SupplierCategoryPromoProps } from "../../_api";

export const ByCategorySection = ({
  data,
}: {
  data: SupplierCategoryPromoProps[];
}) => {
  return (
    <div className="[--max-width:1240px] w-full max-w-[var(--max-width)] mx-auto px-4 lg:px-8 flex flex-col gap-8 py-6">
      <Heading label="Shop By Category" isExpand={"#"} />
      <div className="grid grid-cols-3 gap-6 w-full">
        {data.map((item) => (
          <CategoryCard key={item.slug} {...item} />
        ))}
      </div>
    </div>
  );
};

const CategoryCard = ({ name, slug, image }: SupplierCategoryPromoProps) => {
  return (
    <Link
      href={`/products?categories=${slug}`}
      className="w-full relative bg-white grid grid-cols-2 rounded-lg overflow-hidden"
    >
      <div className="w-full aspect-square p-4">
        <div className="size-full relative rounded-md overflow-hidden">
          <Image
            alt={name}
            src={image ?? "/assets/images/logo-sci.png"}
            fill
            className="object-cover"
            sizes={sizesImage}
          />
        </div>
      </div>
      <div className="w-full font-black items-center flex p-4 bg-[var(--color)]">
        <p className="w-full text-2xl line-clamp-3">{name}</p>
      </div>
    </Link>
  );
};
