import { Heading } from "@/components/heading";
import { cn, sizesImage } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import React from "react";

interface AnimalCardProps {
  href: string;
  label: string;
  classImage?: string;
  classBox?: string;
  urlImage: string;
}

export const AnimalsSection = () => {
  return (
    <div className="w-full max-w-[1240px] mx-auto px-4 lg:px-8 flex flex-col items-center gap-4 md:gap-6 lg:gap-8 py-4 md:py-5 lg:py-6">
      <Heading label="Shop By Pet" />
      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:gap-5 w-full">
        <AnimalCard
          label={"Dogs"}
          classImage={"left-4 md:left-5 lg:left-6 h-[90%] aspect-[854/1171]"}
          urlImage={"/assets/images/dog.png"}
          classBox="justify-end bg-[#B7E8FA]"
          href={`/products?pets=dogs-12345`}
        />
        <AnimalCard
          label={"Cats"}
          classImage={
            "right-4 md:right-5 lg:right-6 h-[85%] aspect-[1454/1188]"
          }
          urlImage={"/assets/images/cat.png"}
          classBox="bg-[#FFEF9E]"
          href={`/products?pets=pets-67890`}
        />
      </div>
    </div>
  );
};

const AnimalCard = ({
  label,
  classImage,
  classBox,
  urlImage,
  href,
}: AnimalCardProps) => {
  return (
    <Link
      href={href}
      className="w-full h-[100px] md:h-[200px] lg:h-[300px] relative bg-white grid grid-rows-5 rounded-lg md:rounded-xl lg:rounded-2xl overflow-hidden"
    >
      <div
        className={cn(
          "w-full rounded-lg md:rounded-xl lg:rounded-2xl row-span-3 px-6 text-xl md:text-2xl lg:text-5xl font-black items-center flex",
          classBox
        )}
      >
        <p className="w-2/3 text-center">{label}</p>
      </div>
      <div className={cn("absolute top-1/2 -translate-y-1/2", classImage)}>
        <div className="size-full relative">
          <Image
            alt={label}
            src={urlImage}
            fill
            className="object-contain"
            sizes={sizesImage}
            priority
          />
        </div>
      </div>
    </Link>
  );
};
