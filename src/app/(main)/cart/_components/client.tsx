"use client";

import { Heading } from "@/components/heading";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { sizesImage } from "@/lib/utils";
import { MinusIcon, PlusIcon, Trash2 } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";

const products = [
  {
    title: "DOXYHCL 10 MG",
    description:
      "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ullam, enim?",
    urlImage: "/assets/images/product-1.png",
    href: "/products/detail",
    stars: 4.8,
    sold: 100,
  },
  {
    title: "DOXYHCL 0.1 G",
    description:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Nam, tempore! Exercitationem, fuga.",
    urlImage: "/assets/images/product-2.png",
    href: "/products/detail",
    stars: 4.9,
    sold: 208,
  },
  {
    title: "DOXYHCL 50 MG",
    description:
      "maxime molestias cum corporis consectetur eligendi aut possimus vero pariatur error! Ipsum deleniti consequuntur quia.",
    urlImage: "/assets/images/product-3.png",
    href: "/products/detail",
    stars: 4.8,
    sold: 312,
  },
  {
    title: "ITRACA",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Incidunt, ipsum explicabo.",
    urlImage: "/assets/images/product-4.png",
    href: "/products/detail",
    stars: 4.7,
    sold: 242,
  },
  {
    title: "DOXYHCL 10 MG",
    description:
      "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ullam, enim?",
    urlImage: "/assets/images/product-1.png",
    href: "/products/detail",
    stars: 4.8,
    sold: 100,
  },
];

const Client = () => {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    if (!isMounted) {
      setIsMounted(true);
    }
  }, []);
  if (!isMounted) return;
  return (
    <div className="bg-sky-50 h-full">
      <div className="max-w-[1240px] mx-auto w-full flex flex-col gap-7 px-4 lg:px-8 py-14">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold ">Your Cart</h1>
          <p className="text-gray-500">(3)</p>
        </div>
        <div className="w-full grid grid-cols-7 gap-6">
          <div className="col-span-5 w-full">
            <div className="flex items-center h-10 px-5 text-sm">
              <div className="flex-none w-6" />
              <div className="w-full">
                <p>Product</p>
              </div>
              <div className="flex-none w-44">
                <p>Quantity</p>
              </div>
              <div className="flex-none w-32">
                <p>Subtotal</p>
              </div>
            </div>
            <div className="flex flex-col rounded shadow bg-white text-sm divide-y divide-gray-300">
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="flex items-center px-5 py-1 gap-3">
                  <div className="flex justify-center flex-none w-6">
                    <Checkbox className="data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500" />
                  </div>
                  <div className="flex items-center w-full gap-2">
                    <div className="relative h-24 aspect-square">
                      <Image
                        fill
                        src={`/assets/images/product-${i + 1}.png`}
                        alt="product"
                        sizes={sizesImage}
                      />
                    </div>
                    <div className="flex flex-col">
                      <p className="truncate">ITRACA</p>
                      <p className="font-bold">
                        Rp {(1000000).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 w-44 flex-none">
                    <div className="flex items-center border border-gray-500 rounded overflow-hidden">
                      <Button
                        className="rounded-none shadow-none hover:bg-green-50 size-8"
                        variant={"ghost"}
                        size={"icon"}
                      >
                        <MinusIcon />
                      </Button>
                      <p className="text-center w-12 font-semibold">1</p>
                      <Button
                        className="rounded-none shadow-none hover:bg-green-50 size-8"
                        variant={"ghost"}
                        size={"icon"}
                      >
                        <PlusIcon />
                      </Button>
                    </div>
                    <Button
                      className=" hover:bg-red-50 text-destructive hover:text-destructive size-8"
                      variant={"ghost"}
                      size={"icon"}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                  <div className="whitespace-nowrap font-bold w-32 flex-none">
                    Rp {(1000000).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="w-full col-span-2">
            <div className="flex items-center h-10 text-sm">
              <p>Total Cart</p>
            </div>
            <div className="bg-white shadow rounded p-5 flex flex-col gap-4 text-sm">
              <div className="flex justify-between items-center text-gray-500">
                <p>Subtotal (3)</p>
                <p className="font-bold text-black">
                  Rp {(3000000).toLocaleString()}
                </p>
              </div>
              <Separator />
              <div className="flex flex-col gap-1.5">
                <Label>Coupon Code</Label>
                <div className="flex items-center">
                  <Input
                    placeholder="Please Enter Code"
                    className="rounded-r-none border-r-0 shadow-none bg-gray-50 placeholder:text-xs focus-visible:ring-0"
                  />
                  <Button className="rounded-l-none shadow-none bg-green-600 hover:bg-green-700">
                    Apply
                  </Button>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-gray-500">
                <p>Total</p>
                <p className="font-bold text-black">
                  Rp {(3000000).toLocaleString()}
                </p>
              </div>
              <Button
                className="w-full flex-auto rounded-full"
                variant={"destructive"}
              >
                Proceed to Checkout
              </Button>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4 pt-5">
          <Heading label="Similar Products" isExpand />
          <div className="grid grid-cols-5 gap-6 w-full">
            {/* {products.map((item, idx) => (
              <ProductCard key={`${item.title}-${idx}`} {...item} />
            ))} */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Client;
