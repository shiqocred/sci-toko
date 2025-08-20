import { Heading } from "@/components/heading";
import { ProductCard } from "@/components/product-card";
import React from "react";
import { ProductProps } from "../../_api";

export const TrendingSection = ({ data }: { data: ProductProps[] }) => {
  return (
    <div className="[--max-width:1240px] w-full max-w-[var(--max-width)] mx-auto px-4 lg:px-8 flex flex-col gap-8 py-6">
      <Heading label="Trending Products" isExpand={"/products"} />
      <div className="grid grid-cols-4 gap-9 w-full">
        {data.map((item, idx) => (
          <ProductCard key={`${item.title}-${idx}`} {...item} />
        ))}
      </div>
    </div>
  );
};
