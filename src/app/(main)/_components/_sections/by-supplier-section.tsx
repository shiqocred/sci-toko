import { Heading } from "@/components/heading";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import React from "react";
import { SupplierCategoryPromoProps } from "../../_api";

export const BySupplierSection = ({
  data,
}: {
  data: SupplierCategoryPromoProps[];
}) => {
  return (
    <div className="[--max-width:1240px] w-full max-w-[var(--max-width)] mx-auto px-4 lg:px-8 flex flex-col items-center gap-4 md:gap-6 lg:gap-8 py-4 md:py-5 lg:py-6">
      <Heading label="Shop By Supplier" />
      <div className="flex items-start justify-center flex-wrap gap-3 w-full min-h-24 md:min-h-36 lg:min-h-[200px]">
        {data.map((item) => (
          <Link key={item.slug} href={`/products?suppliers=${item.slug}`}>
            <Badge
              variant={"outline"}
              className="px-2 py-1 md:px-3 md:py-1.5 lg:px-5 lg:py-2 text-xs md:text-sm lg:text-base rounded-full capitalize border-gray-500"
            >
              {item.name}
            </Badge>
          </Link>
        ))}
      </div>
    </div>
  );
};
