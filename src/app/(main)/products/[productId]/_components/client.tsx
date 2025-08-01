"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useGetProduct } from "../_api";
import { useParams } from "next/navigation";
import { DetailProduct, ImagesGallery, ProductInfo } from "./_section";
import { DialogUnavailable } from "./_dialogs";

export interface VariantDefault {
  id: string;
  old_price: string;
  new_price: string;
  stock: string;
  weight: string;
  discount: string;
}

export interface Variant extends VariantDefault {
  name: string;
}
export interface ProductDetailProps {
  name: string;
  description: string;
  indication: string;
  dosage_usage: string;
  packaging: string;
  registration_number: string;
  storage_instruction: string;
  supplier: {
    name: string;
    slug: string;
  };
  category: {
    name: string;
    slug: string;
  };
  compositions: {
    value: string;
    name: string;
  }[];
  images: string[];
  pets: {
    name: string;
    slug: string;
  }[];
  data_variant: {
    oldPrice: [string] | [string, string];
    newPrice: [string] | [string, string];
    discount: string;
  };
  variants: Variant[] | null;
  default_variant: VariantDefault | null;
}

const Client = () => {
  const { productId } = useParams();
  const [dialog, setDialog] = useState(false);
  const [imageHighlight, setImageHighlight] = useState(
    "/assets/images/logo-sci.png"
  );

  const { data, isSuccess } = useGetProduct({ productId: productId as string });

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

  return (
    <div className="bg-sky-50 h-full">
      <DialogUnavailable open={dialog} onOpenChange={setDialog} />
      <div className="max-w-[1240px] mx-auto w-full flex flex-col gap-7 px-4 lg:px-8 py-14">
        {product && (
          <div className="grid grid-cols-3 w-full gap-6">
            <ImagesGallery
              imageHighlight={imageHighlight}
              setImageHighlight={setImageHighlight}
              images={product.images}
            />
            <DetailProduct product={product} />
            <ProductInfo product={product} />
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
    </div>
  );
};

export default Client;
