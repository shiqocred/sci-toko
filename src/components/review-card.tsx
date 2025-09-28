import React from "react";
import { Rating, RatingButton } from "./ui/shadcn-io/rating";
import Image from "next/image";
import { cn, sizesImage } from "@/lib/utils";

export const ReviewCard = ({
  data,
  className,
  isMarque = false,
}: {
  data: {
    title: string;
    timestamp: string;
    rating: number;
    description: string;
    images: string[];
  };
  className?: string;
  isMarque?: boolean;
}) => {
  return (
    <div className={cn("flex flex-col gap-3 w-full", className)}>
      <div className="flex flex-col">
        <h5
          className={cn(
            "font-semibold",
            isMarque ? "text-sm md:text-base lg:text-lg" : "text-xl"
          )}
        >
          {data.title}
        </h5>
        <p className={cn("text-gray-400", isMarque ? "text-xs" : "text-sm")}>
          {data.timestamp}
        </p>
      </div>
      <Rating defaultValue={data.rating} readOnly>
        {Array.from({ length: 5 }).map((_, index) => (
          <RatingButton
            key={index}
            className="text-yellow-500"
            size={isMarque ? 16 : 20}
          />
        ))}
      </Rating>
      <p
        className={cn(isMarque ? "text-sm" : "text-base")}
      >{`"${data.description}"`}</p>
      {data.images.length > 0 && (
        <div
          className={cn(
            "grid w-full",
            isMarque
              ? "grid-cols-3 xl:grid-cols-4 gap-2"
              : "grid-cols-3 lg:grid-cols-7 gap-3"
          )}
        >
          {data.images.map((i) => (
            <div
              key={i}
              className="w-full aspect-square relative rounded-md overflow-hidden border shadow"
            >
              <Image fill alt="Review" src={i} sizes={sizesImage} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
