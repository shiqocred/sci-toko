import React from "react";
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

export const PromoSection = () => {
  const plugin = React.useRef(
    Autoplay({ delay: 10000, stopOnInteraction: true })
  );
  return (
    <div className="[--max-width:1440px] w-full max-w-[var(--max-width)] mx-auto px-4 lg:px-8 flex flex-col gap-8 py-6">
      <div className="[--max-width:1240px] w-full max-w-[var(--max-width)] mx-auto min-[1440px]:px-8">
        <Heading label="Best Deal" isExpand={"#"} />
      </div>
      <div className=" w-full">
        <Carousel
          opts={{
            align: "center",
            loop: true,
          }}
          className="[--max-w-hero:1440px] w-full max-w-[var(--max-w-hero)] mx-auto group"
          plugins={[plugin.current]}
          onMouseEnter={plugin.current.stop}
          onMouseLeave={() => plugin.current.play()}
        >
          <CarouselContent className="-ml-6">
            {Array.from({ length: 5 }).map((_, index) => (
              <CarouselItem
                key={index}
                className="[--width-active-lg:0_0_37%] [--width-active:0_0_50%] lg:flex-[var(--width-active-lg)] flex-[var(--width-active)] pl-6"
              >
                <Link className="w-full" href={"#"}>
                  <div className="[--aspect-ratio-slider:608/275] relative aspect-[var(--aspect-ratio-slider)] w-full">
                    <Image
                      alt={`slider-${index}`}
                      src={"/assets/images/promo-1.png"}
                      fill
                      sizes={sizesImage}
                    />
                  </div>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </div>
  );
};
