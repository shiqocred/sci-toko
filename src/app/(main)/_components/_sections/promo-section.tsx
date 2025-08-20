import React, { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import Autoplay from "embla-carousel-autoplay";

import { sizesImage } from "@/lib/utils";

import {
  Carousel,
  CarouselItem,
  CarouselContent,
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
    <div className="w-full max-w-[1440px] mx-auto px-4 lg:px-8 flex flex-col gap-8 py-6">
      <div className="w-full max-w-[1240px] mx-auto min-[1440px]:px-8">
        <Heading label="Best Deal" isExpand={"#"} />
      </div>

      <Carousel
        opts={{ align: "center", loop: true }}
        className="w-full max-w-[1440px] mx-auto group"
        plugins={[plugin]}
        onMouseEnter={plugin.stop}
        onMouseLeave={() => plugin.play()}
      >
        <CarouselContent className="-ml-6">
          {data.map((item) => (
            <CarouselItem
              key={item.slug}
              className="pl-6 flex-[0_0_50%] lg:flex-[0_0_37%]"
            >
              <Link className="w-full" href={getPromoHref(item.slug)}>
                <div className="relative aspect-[21/10] w-full rounded-lg overflow-hidden group">
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
