"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ProductDetailProps, useGetProduct } from "../_api";
import { useParams } from "next/navigation";
import { DetailProduct, ImagesGallery, ProductInfo } from "./_section";
import { DialogUnavailable, DrawerCart } from "./_dialogs";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { Loader, ShoppingBag } from "lucide-react";
import Link from "next/link";

const Client = () => {
  const { status } = useSession();
  const { productId } = useParams();
  const [dialog, setDialog] = useState(false);
  const [isDialog, setIsDialog] = useState(false);
  const [imageHighlight, setImageHighlight] = useState(
    "/assets/images/logo-sci.png"
  );

  const { data, isSuccess, isPending, error, isError } = useGetProduct({
    productId: productId as string,
  });

  const product: ProductDetailProps | undefined = useMemo(() => {
    return data?.data;
  }, [data]);

  useEffect(() => {
    if (data && isSuccess) {
      const productFisrtImage = data?.data.images[0];
      setImageHighlight(productFisrtImage);
      if (
        (data.data.default_variant &&
          parseFloat(data.data.default_variant.stock) < 1) ||
        (data.data.variants &&
          data.data.variants.every((v) => Number(v.stock) < 1))
      ) {
        setDialog(true);
      } else {
        setDialog(false);
      }
    }
  }, [data, isSuccess]);

  if (isPending) {
    return (
      <div className="flex flex-col gap-1 w-full h-[50vh] relative items-center justify-center">
        <Loader className="animate-spin size-5" />
        <p className="ml-2 text-sm">Loading...</p>
      </div>
    );
  }

  if (isError && error && error.status === 404) {
    return (
      <div className="flex w-full justify-center flex-col items-center h-[50vh] gap-4">
        <div className="size-20 md:size-24 lg:size-32 flex items-center justify-center rounded-full bg-sci shadow text-white relative overflow-hidden">
          <ShoppingBag className="size-10 md:size-12 lg:size-14" />
          <div className="size-8 md:size-12 lg:size-20 bg-white/10 rounded-full absolute -right-0 -bottom-0 md:-right-2 md:-bottom-2 lg:-right-5 lg:-bottom-5" />
          <div className="size-5 md:size-8 lg:size-10 bg-white/10 rounded-full absolute -left-0 -top-0" />
        </div>
        <h1 className="text-sm md:text-lg lg:text-xl font-medium">
          Product not found
        </h1>
        <div className="flex items-center gap-2 md:gap-3">
          <Button
            variant={"destructiveOutline"}
            className="bg-transparent px-3 py-1.5 h-8 text-xs md:px-3 md:py-1.5 md:h-8 md:text-xs"
            asChild
          >
            <Link href={"/products"}>Browse Products</Link>
          </Button>
          <Button
            variant={"destructive"}
            asChild
            className="px-3 py-1.5 h-8 text-xs md:px-3 md:py-1.5 md:h-8 md:text-xs"
          >
            <Link href={"/"}>Go To Homepage</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-sky-50 h-full relative">
      <DialogUnavailable open={dialog} onOpenChange={setDialog} />
      <DrawerCart
        open={isDialog}
        onOpenChange={() => setIsDialog(false)}
        product={product}
        status={status}
        setIsDialog={setIsDialog}
      />
      <div className="max-w-[1240px] mx-auto w-full flex flex-col gap-3 md:gap-5 lg:gap-7 px-4 lg:px-8 pt-6 md:py-10 lg:py-14 pb-10 md:pb-16 lg:pb-24">
        {product && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full gap-4 lg:gap-6">
            <ImagesGallery
              imageHighlight={imageHighlight}
              setImageHighlight={setImageHighlight}
              images={product.images}
            />
            <DetailProduct product={product} />
            <ProductInfo status={status} product={product} />
          </div>
        )}

        {/* <div className="flex flex-col gap-4">
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
        </div> */}
      </div>
      <div className="w-full fixed bottom-0 bg-white p-4 pb-6 md:hidden border-t shadow z-10 lg:z-auto">
        <Button
          onClick={() => setIsDialog(true)}
          variant={"destructive"}
          className="w-full flex-auto"
        >
          Add to cart
        </Button>
      </div>
    </div>
  );
};

export default Client;
