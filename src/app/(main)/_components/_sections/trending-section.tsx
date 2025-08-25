import { Heading } from "@/components/heading";
import { ProductCard } from "@/components/product-card";
import React from "react";
import { ProductProps } from "../../_api";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

export const TrendingSection = ({ data }: { data: ProductProps[] }) => {
  return (
    <div className="[--max-width:1240px] w-full max-w-[var(--max-width)] mx-auto px-4 lg:px-8 flex flex-col gap-4 md:gap-6 lg:gap-8 py-4 md:py-5 lg:py-6">
      <Heading label="Trending Products" isExpand={"/products"} />
      <Carousel
        opts={{ align: "start", loop: false }}
        className="w-full max-w-[1240px] mx-auto group"
      >
        <CarouselContent className="lg:-ml-9 md:-ml-6 -ml-4">
          {data.map((item, idx) => (
            <CarouselItem
              key={item.slug}
              className="lg:pl-9 md:pl-6 pl-4 flex-[0_0_50%] md:flex-[0_0_30%] lg:flex-[0_0_25%]"
            >
              <ProductCard key={`${item.title}-${idx}`} {...item} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
};
