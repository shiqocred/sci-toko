import { Heading } from "@/components/heading";
import { sizesImage } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { SupplierCategoryPromoProps } from "../../_api";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

function generateStableHsl(key: string) {
  let hash = 0;

  for (const char of key) {
    const code = char.codePointAt(0)!;
    hash = code + ((hash << 5) - hash);
  }

  return `hsl(${Math.abs(hash) % 360}, 70%, 80%)`;
}

export const ByCategorySection = ({
  data,
}: {
  data: SupplierCategoryPromoProps[];
}) => {
  return (
    <div className="w-full max-w-[1240px] mx-auto px-4 lg:px-8 flex flex-col gap-4 md:gap-6 lg:gap-8 py-4 md:py-5 lg:py-6">
      <Carousel
        opts={{ align: "start", loop: false }}
        className="w-full max-w-[1440px] mx-auto flex flex-col gap-4 md:gap-6 lg:gap-8"
      >
        <div className="w-full max-w-[1240px] mx-auto flex items-center justify-between gap-4">
          <Heading label="Shop By Category" />
          <div className="items-center gap-2 justify-center flex">
            <CarouselPrevious className="relative left-auto top-auto -translate-y-0" />
            <CarouselNext className="relative right-auto top-auto -translate-y-0" />
          </div>
        </div>
        <CarouselContent className="lg:-ml-6">
          {data.map((item) => (
            <CarouselItem
              key={item.slug}
              className="lg:pl-6 flex-[0_0_65%] md:flex-[0_0_40%] lg:flex-[0_0_33%] group"
            >
              <CategoryCard key={item.slug} {...item} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
};

const CategoryCard = ({ name, slug, image }: SupplierCategoryPromoProps) => {
  return (
    <Link
      href={`/products?categories=${slug}`}
      className="w-full relative bg-white grid grid-cols-2 rounded-lg overflow-hidden h-full border"
    >
      <div className="w-full aspect-square">
        <div className="size-full relative overflow-hidden">
          <Image
            alt={name}
            src={image ?? "/assets/images/logo-sci.png"}
            fill
            className="object-cover group-hover:scale-105 transition-all"
            sizes={sizesImage}
          />
        </div>
      </div>
      <div
        className="w-full font-bold items-center text-center flex p-2 md:p-3 lg:p-4"
        style={{
          backgroundColor: generateStableHsl(name),
        }}
      >
        <p className="w-full text-sm md:text-lg lg:text-2xl line-clamp-3">
          {name}
        </p>
      </div>
    </Link>
  );
};
