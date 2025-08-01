import { Heading } from "@/components/heading";
import { ProductCard } from "@/components/product-card";
import React from "react";

// const data = [
//   {
//     title: "DOXYHCL 10 MG",
//     description:
//       "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ullam, enim?",
//     urlImage: "/assets/images/product-1.png",
//     href: "/products/detail",
//     stars: 4.8,
//     sold: 100,
//   },
//   {
//     title: "DOXYHCL 0.1 G",
//     description:
//       "Lorem ipsum dolor sit amet consectetur adipisicing elit. Nam, tempore! Exercitationem, fuga.",
//     urlImage: "/assets/images/product-2.png",
//     href: "/products/detail",
//     stars: 4.9,
//     sold: 208,
//   },
//   {
//     title: "DOXYHCL 50 MG",
//     description:
//       "maxime molestias cum corporis consectetur eligendi aut possimus vero pariatur error! Ipsum deleniti consequuntur quia.",
//     urlImage: "/assets/images/product-3.png",
//     href: "/products/detail",
//     stars: 4.8,
//     sold: 312,
//   },
//   {
//     title: "ITRACA",
//     description:
//       "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Incidunt, ipsum explicabo.",
//     urlImage: "/assets/images/product-4.png",
//     href: "/products/detail",
//     stars: 4.7,
//     sold: 242,
//   },
// ];

export const TrendingSection = ({ data }: { data: any[] }) => {
  return (
    <div className="[--max-width:1240px] w-full max-w-[var(--max-width)] mx-auto px-4 lg:px-8 flex flex-col gap-8 py-6">
      <Heading label="Trending Products" isExpand={"/products"} />
      <div className="grid grid-cols-4 gap-9 w-full">
        {data.map((item, idx) => (
          <ProductCard key={`${item.title}-${idx}`} {...item} />
        ))}
      </div>
    </div>
  );
};
