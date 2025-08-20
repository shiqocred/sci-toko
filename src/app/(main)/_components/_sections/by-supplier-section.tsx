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
    <div className="[--max-width:1240px] w-full max-w-[var(--max-width)] mx-auto px-4 lg:px-8 flex flex-col items-center gap-8 py-6">
      <Heading label="Shop By Supplier" />
      <div className="flex items-start justify-center flex-wrap gap-3 w-full min-h-[200px]">
        {data.map((item) => (
          <Link key={item.slug} href={`/products?suppliers=${item.slug}`}>
            <Badge
              variant={"outline"}
              className="px-5 py-2 text-base rounded-full capitalize border-gray-500"
            >
              {item.name}
            </Badge>
          </Link>
        ))}
      </div>
    </div>
  );
};
