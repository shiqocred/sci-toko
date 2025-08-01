import { Heading } from "@/components/heading";
import { cn, sizesImage } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import React from "react";

interface CategoryCardProps {
  id: string;
  name: string;
  className?: string;
  image: string;
}

// const data = [
//   {
//     label: "Farm Products",
//     className: "[--color:#DEF7D6]",
//     urlImage: "/assets/images/category-1.png",
//     href: "#",
//   },
//   {
//     label: "Feed Additive",
//     className: "[--color:#D8D6F7]",
//     urlImage: "/assets/images/category-2.png",
//     href: "#",
//   },
//   {
//     label: "Companion Animal",
//     className: "[--color:#F7D6F4]",
//     urlImage: "/assets/images/category-3.png",
//     href: "#",
//   },
// ];

export const ByCategorySection = ({ data }: { data: any[] }) => {
  return (
    <div className="[--max-width:1240px] w-full max-w-[var(--max-width)] mx-auto px-4 lg:px-8 flex flex-col gap-8 py-6">
      <Heading label="Shop By Category" isExpand={"#"} />
      <div className="grid grid-cols-3 gap-6 w-full">
        {data.map((item) => (
          <CategoryCard key={item.id} {...item} />
        ))}
      </div>
    </div>
  );
};

const CategoryCard = ({ id, name, className, image }: CategoryCardProps) => {
  return (
    <Link
      href={`/products?categories=${id}`}
      className="w-full relative bg-white grid grid-cols-2 rounded-2xl overflow-hidden"
    >
      <div className="w-full aspect-square p-4">
        <div className="size-full relative">
          <Image
            alt={name}
            src={image ?? "/assets/images/logo-sci.png"}
            fill
            className="object-contain"
            sizes={sizesImage}
          />
        </div>
      </div>
      <div
        className={cn(
          "w-full font-black items-center flex p-4 bg-[var(--color)]",
          className
        )}
      >
        <p className="w-full text-2xl">{name}</p>
      </div>
    </Link>
  );
};
