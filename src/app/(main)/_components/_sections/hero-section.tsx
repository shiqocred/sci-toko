import React from "react";
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
import { sizesImage } from "@/lib/utils";

export const HeroSection = () => {
  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );
  return (
    <div
      className="[--height-homepage:610px] min-[1440px]:h-[var(--height-homepage)] w-full aspect-[1442/610] relative bg-repeat-x bg-[position:center_bottom] bg-[length:auto_100%] flex items-center"
      style={{
        backgroundImage: "url('/assets/images/homepage.webp')",
      }}
    >
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
        <CarouselContent className="-ml-8">
          {Array.from({ length: 5 }).map((_, index) => (
            <CarouselItem
              key={index}
              className="[--width-active:0_0_75.3%] flex-[var(--width-active)] pl-8"
            >
              <Link className="w-full" href={"#"}>
                <div className="[--aspect-ratio-slider:1050/500] relative aspect-[var(--aspect-ratio-slider)] w-full">
                  <Image
                    alt={`slider-${index}`}
                    src={"/assets/images/slider.png"}
                    fill
                    sizes={sizesImage}
                    priority
                  />
                </div>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>

        <div className="[--max-witdh:75.3%] absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[var(--max-witdh)] z-10  justify-between items-center pointer-events-none hidden group-hover:flex">
          <div className="pointer-events-auto">
            <CarouselPrevious className="relative -ml-4 lg::-ml-5 left-auto top-auto translate-0 lg:size-10 shadow-lg" />
          </div>
          <div className="pointer-events-auto">
            <CarouselNext className="relative -mr-4 lg::-mr-5 right-auto top-auto translate-0 lg:size-10 shadow-lg" />
          </div>
        </div>
      </Carousel>
    </div>
  );
};
