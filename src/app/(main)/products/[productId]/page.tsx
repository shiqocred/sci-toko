import React from "react";
import Client from "./_components/client";
import { Metadata } from "next";
import { metadataProductDetail } from "@/lib/api";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ productId: string }>;
}): Promise<Metadata> {
  const { productId } = await params;
  const data = await metadataProductDetail(productId);

  return {
    title: `Product ${data.data?.name}`,
    description: data.data?.description,
    openGraph: {
      images: [data.data?.image ?? "/assets/images/logo-sci.png"],
    },
  };
}

const ProductDetailPage = () => {
  return (
    <div className="h-full">
      <Client />
    </div>
  );
};

export default ProductDetailPage;
