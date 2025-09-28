import React, { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import Autoplay from "embla-carousel-autoplay";

import { sizesImage } from "@/lib/utils";

import {
  Carousel,
  CarouselItem,
  CarouselContent,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { Heading } from "@/components/heading";
import { SupplierCategoryPromoProps } from "../../_api";

export const PromoSection = ({
  data,
}: {
  data: SupplierCategoryPromoProps[];
}) => {
  const plugin = useMemo(
    () => Autoplay({ delay: 10000, stopOnInteraction: true }),
    []
  );

  const DEFAULT_IMAGE = "/assets/images/logo-sci.png";

  const getPromoHref = (slug: string) => `/products?promos=${slug}`;

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 lg:px-8 py-4 md:py-5 lg:py-6">
      <Carousel
        opts={{ align: "center", loop: true }}
        className="w-full max-w-[1440px] mx-auto flex flex-col gap-4 md:gap-6 lg:gap-8"
        plugins={[plugin]}
        onMouseEnter={plugin.stop}
        onMouseLeave={() => {
          if (data.length > 1) {
            plugin.reset();
          }
        }}
      >
        <div className="w-full max-w-[1240px] mx-auto min-[1440px]:px-8 flex items-center justify-between gap-4">
          <Heading label="Best Deal" />
          <div className="items-center gap-2 justify-center flex">
            <CarouselPrevious className="relative left-auto top-auto -translate-y-0" />
            <CarouselNext className="relative right-auto top-auto -translate-y-0" />
          </div>
        </div>
        <CarouselContent className="lg:-ml-6">
          {data.map((item) => (
            <CarouselItem
              key={item.slug}
              className="lg:pl-6 flex-[0_0_75%] md:flex-[0_0_50%] lg:flex-[0_0_37%] group"
            >
              <Link className="w-full" href={getPromoHref(item.slug)}>
                <div className="relative aspect-[21/10] w-full rounded-lg overflow-hidden bg-white shadow mb-1">
                  <Image
                    alt={item.name}
                    src={item.image ?? DEFAULT_IMAGE}
                    fill
                    sizes={sizesImage}
                    className="object-cover group-hover:scale-105 transition-all"
                  />
                </div>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
};
