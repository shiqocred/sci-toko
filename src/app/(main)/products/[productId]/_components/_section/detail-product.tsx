"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ProductDetailProps } from "../../_api";

interface DetailProductProps {
  product: ProductDetailProps;
}

export const DetailProduct = ({ product }: DetailProductProps) => {
  return (
    <div className="w-full order-3 lg:order-2">
      <Tabs
        defaultValue="detail"
        className="gap-0 h-fit shadow rounded-lg overflow-hidden"
      >
        <TabsList className="w-full bg-transparent gap-1 p-0 shadow-none *:w-full *:flex-auto *:rounded-none *:shadow-none *:text-gray-500 *:bg-white *:hover:bg-green-50 *:hover:text-green-600 *:border-0 *:border-b-2 *:border-gray-300 *:data-[state=active]:shadow-none *:data-[state=active]:border-green-600 *:data-[state=active]:text-green-600 *:hover:data-[state=active]:bg-green-50">
          <TabsTrigger value="detail" asChild>
            <Button>Detail</Button>
          </TabsTrigger>
          <TabsTrigger value="composition" asChild>
            <Button>Composition</Button>
          </TabsTrigger>
          <TabsTrigger value="notes" asChild>
            <Button>Notes</Button>
          </TabsTrigger>
        </TabsList>
        <TabsContent
          value="detail"
          className="bg-white p-5 flex flex-col text-sm gap-4 leading-normal"
        >
          <span className="text-gray-500 ">{product?.description}</span>
          <div className="flex flex-col">
            <p className="font-bold">Indication</p>
            {product?.indication ? (
              <div
                className="text-sm text-gray-500 leading-relaxed prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{
                  __html: product?.indication,
                }}
              />
            ) : (
              "-"
            )}
          </div>
          <div className="flex flex-col">
            <p className="font-bold">Dosage & Usage</p>
            {product?.dosage_usage ? (
              <div
                className="text-sm text-gray-500 leading-relaxed prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{
                  __html: product?.dosage_usage,
                }}
              />
            ) : (
              "-"
            )}
          </div>
        </TabsContent>
        <TabsContent
          value="composition"
          className="bg-white p-5 flex flex-col text-sm leading-normal gap-4"
        >
          <span className="font-bold">One tablet contains:</span>
          <div className="text-gray-500">
            {product?.compositions.map((comp, index) => (
              <div
                key={`${comp.name}-${comp.value}-${index}`}
                className="flex items-center gap-1 justify-between h-8"
              >
                <div className="text-sm font-medium tracking-wider">
                  {comp.name}
                </div>
                <div className="h-[2px] flex-1 bg-[radial-gradient(circle,_#364153_1px,_transparent_1px)] [background-size:5px_4px] mt-2" />
                <div className="text-xs">{comp.value}</div>
              </div>
            ))}
          </div>
        </TabsContent>
        <TabsContent
          value="notes"
          className="bg-white p-5 flex flex-col text-sm gap-4 leading-normal"
        >
          <div className="flex flex-col">
            <span className="font-bold">Storage Instruction</span>
            <span className="text-gray-500 ">
              {product?.storage_instruction
                ? product?.storage_instruction
                : "-"}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-bold">Packaging</span>
            <span className="text-gray-500 ">
              {product?.packaging ? product?.packaging : "-"}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-bold">Registration Number </span>
            <span className="text-gray-500 ">
              {product?.registration_number
                ? product?.registration_number
                : "-"}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-bold">Produced by</span>
            <Link
              href={`/products?suppliers=${product?.supplier.slug}`}
              className="text-gray-500 hover:underline underline-offset-2 hover:text-gray-700"
            >
              {product?.supplier.name}
            </Link>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
