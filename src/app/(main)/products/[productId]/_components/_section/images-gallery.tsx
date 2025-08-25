"use client";

import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn, sizesImage } from "@/lib/utils";

interface ImagesGalleryProps {
  imageHighlight: string;
  setImageHighlight: React.Dispatch<React.SetStateAction<string>>;
  images: string[];
}

export const ImagesGallery = ({
  imageHighlight,
  setImageHighlight,
  images,
}: ImagesGalleryProps) => {
  return (
    <div className="flex flex-col gap-3 md:gap-4 w-full order-1">
      <div className="w-full relative aspect-square bg-white rounded-lg overflow-hidden shadow">
        <Image
          alt="product"
          fill
          src={imageHighlight}
          className="object-contain"
          sizes={sizesImage}
        />
      </div>
      <div className="flex flex-col items-center w-full">
        <Carousel
          opts={{
            align: "center",
          }}
          className="w-full group relative"
        >
          <CarouselPrevious
            className="absolute left-0 top-1/2 -mt-2 -translate-y-1/2 z-10 shadow-lg w-7 h-14 rounded-l-none rounded-r bg-white hover:bg-gray-100 [&_svg]:!size-5 [&_svg]:text-sci  disabled:opacity-0 border border-l-0 opacity-0 group-hover:opacity-100 transition-all"
            variant={"default"}
            icon={ChevronLeft}
          />
          <CarouselNext
            className="absolute right-0 top-1/2 -mt-2 -translate-y-1/2 z-10 shadow-lg w-7 h-14 rounded-r-none rounded-l bg-white hover:bg-gray-100 [&_svg]:!size-5 [&_svg]:text-sci  disabled:opacity-0 border border-r-0 opacity-0 group-hover:opacity-100 transition-all"
            variant={"default"}
            icon={ChevronRight}
          />
          <CarouselContent className="-ml-3 md:-ml-4 pb-2">
            {images.map((item) => (
              <CarouselItem
                key={item}
                className="basis-1/4 lg:basis-1/3 pl-3 md:pl-4 select-none"
              >
                <div
                  className={cn(
                    "w-full relative aspect-square bg-white rounded-lg overflow-hidden shadow",
                    item === imageHighlight && "border border-sci"
                  )}
                  onMouseEnter={() => setImageHighlight(item)}
                >
                  <Image
                    alt={`slider-${item}`}
                    src={item ?? "/assets/images/logo-sci.png"}
                    fill
                    className="object-contain"
                    sizes={sizesImage}
                    priority
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </div>
  );
};
