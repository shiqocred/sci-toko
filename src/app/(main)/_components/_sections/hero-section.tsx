import React, { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import Autoplay from "embla-carousel-autoplay";

import {
  Carousel,
  CarouselNext,
  CarouselItem,
  CarouselContent,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn, sizesImage } from "@/lib/utils";
import { BannerProps } from "../../_api";

export const HeroSection = ({ data }: { data: BannerProps[] }) => {
  const plugin = useMemo(
    () => Autoplay({ delay: 10000, stopOnInteraction: true }),
    []
  );

  const handleHref = (item: BannerProps) => {
    const typeMap: Record<string, string> = {
      CATEGORIES: "categories",
      PETS: "pets",
      SUPPLIERS: "suppliers",
      PROMOS: "promos",
    };

    if (typeMap[item.type]) {
      const param = item.target.map(encodeURIComponent).join(";");
      return `/products?${typeMap[item.type]}=${param}`;
    }

    return `/products/${item.target[0]}`;
  };

  const DEFAULT_IMAGE = "/assets/images/logo-sci.png";

  return (
    <div
      className="min-[1440px]:h-[610px] w-full aspect-[1442/610] relative bg-repeat-x bg-[position:center_bottom] bg-[length:auto_100%] flex items-center"
      style={{ backgroundImage: "url('/assets/images/homepage.webp')" }}
    >
      <Carousel
        opts={{ align: "center", loop: true }}
        className="w-full max-w-[1440px] mx-auto group"
        plugins={[plugin]}
        onMouseEnter={plugin.stop}
        onMouseLeave={() => {
          if (data.length > 1) {
            plugin.play();
          }
        }}
      >
        <CarouselContent className="ml-0 lg:-ml-8">
          {data.map((item) => (
            <CarouselItem
              key={item.name}
              className={cn(
                "pl-0 lg:pl-8",
                data.length < 3
                  ? "lg:h-[550px] w-full flex items-center"
                  : "lg:flex-[0_0_75.3%]"
              )}
            >
              <Link
                className={cn(
                  "w-full",
                  data.length < 3 && "lg:h-[515px] lg:flex lg:justify-center"
                )}
                href={handleHref(item)}
              >
                <div className="relative aspect-[21/10] h-full lg:rounded-lg overflow-hidden">
                  <Image
                    alt={item.name}
                    src={item.image ?? DEFAULT_IMAGE}
                    fill
                    sizes={sizesImage}
                    className="object-cover"
                    priority
                  />
                </div>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>

        <div
          className={cn(
            "[--max-witdh:75.3%] absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[var(--max-witdh)] z-10  justify-between items-center pointer-events-none hidden lg:group-hover:flex",
            data.length === 1 && "!hidden"
          )}
        >
          <div className="pointer-events-auto">
            <CarouselPrevious className="relative -ml-4 lg:-ml-5 left-auto top-auto translate-0 lg:size-10 shadow-lg" />
          </div>
          <div className="pointer-events-auto">
            <CarouselNext className="relative -mr-4 lg:-mr-5 right-auto top-auto translate-0 lg:size-10 shadow-lg" />
          </div>
        </div>
      </Carousel>
    </div>
  );
};
