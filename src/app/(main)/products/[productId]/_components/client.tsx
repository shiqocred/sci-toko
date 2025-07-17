"use client";

import { Heading } from "@/components/heading";
import { ProductCard } from "@/components/product-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { sizesImage } from "@/lib/utils";
import { StarIcon, Truck } from "lucide-react";
import Image from "next/image";
import React from "react";

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
const lastSeen = [
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
];

const Client = () => {
  return (
    <div className="bg-sky-50 h-full">
      <div className="max-w-[1240px] mx-auto w-full flex flex-col gap-7 px-4 lg:px-8 py-14">
        <div className="grid grid-cols-3 w-full gap-6">
          <div className="flex flex-col gap-4 w-full">
            <div className="w-full relative aspect-square bg-white rounded overflow-hidden shadow">
              <Image
                alt="product"
                fill
                src={"/assets/images/product-1.png"}
                sizes={sizesImage}
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="w-full relative aspect-square bg-white rounded overflow-hidden shadow">
                <Image
                  alt="product"
                  fill
                  src={"/assets/images/product-1.png"}
                  sizes={sizesImage}
                />
              </div>
              <div className="w-full relative aspect-square bg-white rounded overflow-hidden shadow">
                <Image
                  alt="product"
                  fill
                  src={"/assets/images/product-2.png"}
                  sizes={sizesImage}
                />
              </div>
              <div className="w-full relative aspect-square bg-white rounded overflow-hidden shadow">
                <Image
                  alt="product"
                  fill
                  src={"/assets/images/product-3.png"}
                  sizes={sizesImage}
                />
              </div>
            </div>
          </div>
          <div className="w-full rounded overflow-hidden shadow">
            <Tabs defaultValue="detail" className="gap-0 h-full">
              <TabsList className="w-full bg-transparent gap-1 p-0 shadow-none *:w-full *:flex-auto *:rounded-none *:shadow-none *:text-gray-500 *:bg-white *:hover:bg-green-50 *:hover:text-green-600 *:border-0 *:border-b-2 *:border-gray-300 *:data-[state=active]:shadow-none *:data-[state=active]:border-green-600 *:data-[state=active]:text-green-600 *:hover:data-[state=active]:bg-green-50">
                <TabsTrigger value="detail" asChild>
                  <Button>Detail</Button>
                </TabsTrigger>
                <TabsTrigger value="compotition" asChild>
                  <Button>Compotition</Button>
                </TabsTrigger>
                <TabsTrigger value="notes" asChild>
                  <Button>Notes</Button>
                </TabsTrigger>
              </TabsList>
              <TabsContent
                value="detail"
                className="bg-white p-5 flex flex-col text-sm gap-4 leading-normal"
              >
                <div className="flex flex-col">
                  <span className="font-bold">Indication</span>
                  <span className="text-gray-500 ">
                    For the treatment infections caused by or associated with
                    doxycylcline susceptible organisms in dogs and cats, gram
                    positive (Streptococci sp, Staphylococcus sp, Bacillus
                    anthracis, C. tetani, Listeria monocytogenes) and gram
                    negative (Escherichia coli, Pasteurella spp, Salmonella spp,
                    Brucella, Haemophilus, Klabsiella) bacteria. Doxyxycline
                    also can inhibit the activity of rickettsia, mycoplasma,
                    spirochete, etc
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-bold">Dosage & Usage</span>
                  <span className="text-gray-500 ">
                    Oral use. The recommended dose for dogs and cats is 5 - 10
                    mg per kg bodyweight per day. Therapy should continue for 3
                    to 5 days or follow the veterinarian&apos;s advice
                  </span>
                </div>
              </TabsContent>
              <TabsContent
                value="compotition"
                className="bg-white p-5 flex flex-col text-sm leading-normal gap-1"
              >
                <span className="font-bold">One tablet contains:</span>
                <div className="text-gray-500 gap-1">
                  <p className="w-full flex items-center gap-1">
                    <span className="whitespace-nowrap">
                      Doxycycline hyclate
                    </span>
                    <span className="w-full border-b block border-dotted h-3" />
                    <span className="whitespace-nowrap">100 mg</span>
                  </p>
                  <p className="w-full flex items-center gap-1">
                    <span className="whitespace-nowrap">
                      Sodium startch glycolate
                    </span>
                    <span className="w-full border-b block border-dotted h-3" />
                    <span className="whitespace-nowrap">80 mg</span>
                  </p>
                  <p className="w-full flex items-center gap-1">
                    <span className="whitespace-nowrap">
                      Microcrystaline cellulose
                    </span>
                    <span className="w-full border-b block border-dotted h-3" />
                    <span className="whitespace-nowrap">50 mg</span>
                  </p>
                  <p className="w-full flex items-center gap-1">
                    <span className="whitespace-nowrap">Silicon dioxide</span>
                    <span className="w-full border-b block border-dotted h-3" />
                    <span className="whitespace-nowrap">90 mg</span>
                  </p>
                  <p className="w-full flex items-center gap-1">
                    <span className="whitespace-nowrap">
                      Magnesium stearate
                    </span>
                    <span className="w-full border-b block border-dotted h-3" />
                    <span className="whitespace-nowrap">110 mg</span>
                  </p>
                </div>
              </TabsContent>
              <TabsContent
                value="notes"
                className="bg-white p-5 flex flex-col text-sm gap-4 leading-normal"
              >
                <div className="flex flex-col">
                  <span className="font-bold">Storage Instruction</span>
                  <span className="text-gray-500 ">
                    Protect from light and keep sealed
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-bold">Packaging</span>
                  <span className="text-gray-500 ">
                    0.1 g/tablet, 8 tablets/plate, 6 plates/box
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-bold">Expired Time</span>
                  <span className="text-gray-500 ">
                    24 months after production date
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-bold">Registration Number </span>
                  <span className="text-gray-500 ">
                    KEMENTAN RI NO. I. 240772623 PKM
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-bold">Produced by</span>
                  <span className="text-gray-500 ">
                    SHANGHAI HANVET BIO-PHARM CO.,LTD
                  </span>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          <div className="w-full bg-white shadow rounded p-5 flex flex-col gap-3.5">
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-bold">DOXYHCL 0.1 G</h2>
              <div className="flex items-center gap-3">
                <StarIcon className="size-4 fill-yellow-400 text-transparent" />
                <div className="flex items-center text-xs gap-2 text-gray-500">
                  <span>4.8</span>
                  <span className="h-4 w-px bg-gray-500" />
                  <span>100 Sold</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={"outline"}
                  className="px-5 py-1 rounded border-gray-500 text-gray-500"
                >
                  Cat
                </Badge>
                <Badge
                  variant={"outline"}
                  className="px-5 py-1 rounded border-gray-500 text-gray-500"
                >
                  Pet Medicine
                </Badge>
              </div>
            </div>
            <Separator className="bg-gray-500" />
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <p className="text-3xl font-bold">
                  Rp {(1199000).toLocaleString()}
                </p>
                <p className="text-sm">Save 10%</p>
              </div>
              <Button
                variant={"destructive"}
                className="flex-auto w-full rounded-full"
              >
                Add to Cart
              </Button>
            </div>
            <Separator className="bg-gray-500" />
            <div className="flex items-center justify-center gap-4">
              <div className="rounded-full border size-14 flex items-center justify-center text-xs border-black">
                Benefit
              </div>
              <div className="rounded-full border size-14 flex items-center justify-center text-xs border-black">
                Benefit
              </div>
              <div className="rounded-full border size-14 flex items-center justify-center text-xs border-black">
                Benefit
              </div>
              <div className="rounded-full border size-14 flex items-center justify-center text-xs border-black">
                Benefit
              </div>
            </div>
            <Separator className="bg-gray-500" />
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 font-bold">
                <Truck className="size-5" />
                <p>Shipping Info</p>
              </div>
              <div className="flex flex-col pl-7 text-sm gap-1 text-gray-500">
                <div className="flex items-center gap-1">
                  <p>Sent from:</p>
                  <p className="font-semibold">SCI Main Warehouse, Cakung</p>
                </div>
                <div className="flex items-center gap-1">
                  <p>Regular Shipping:</p>
                  <p className="font-semibold">Start from Rp20.000</p>
                </div>
                <div className="flex items-center gap-1">
                  <p>Estimated Shipping Process:</p>
                  <p className="font-semibold">2-3 Days</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <Heading label="Similar Products" isExpand />
          <div className="grid grid-cols-5 gap-6 w-full">
            {products.map((item, idx) => (
              <ProductCard key={`${item.title}-${idx}`} {...item} />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <Heading label="Last Seen Products" />
          <div className="grid grid-cols-5 gap-6 w-full">
            {lastSeen.map((item, idx) => (
              <ProductCard key={`${item.title}-${idx}`} {...item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Client;
