// components/checkout/ProductCardVariants.tsx
import Image from "next/image";
import { Tag } from "lucide-react";
import { formatRupiah, sizesImage } from "@/lib/utils";
import { ProductVariant } from "../types";

interface Props {
  image: string | null;
  title: string;
  variants: ProductVariant[];
}

export function ProductCardVariants({ image, title, variants }: Props) {
  return (
    <div className="border rounded-md overflow-hidden flex flex-col">
      <div className="flex border-b">
        <div className="size-24 border-r flex-none flex items-center justify-center">
          <div className="size-20 relative rounded-sm overflow-hidden">
            <Image
              src={image ?? "/assets/images/logo-sci.png"}
              alt={title}
              fill
              sizes={sizesImage}
              className="object-contain"
            />
          </div>
        </div>
        <div className="p-2 flex flex-col justify-center flex-1">
          <p className="line-clamp-2 font-medium text-sm">{title}</p>
        </div>
      </div>
      {variants.map((v) => (
        <div
          key={v.id}
          className="grid grid-cols-6 border-b last:border-b-0 py-2 px-3 text-sm"
        >
          <div className="col-span-3 flex items-center gap-2">
            <Tag className="size-3" />
            <p className="font-medium line-clamp-1">{v.name}</p>
          </div>
          <p className="text-center">{v.qty}x</p>
          <p className="col-span-2 text-end font-semibold">
            {formatRupiah(v.price)}
          </p>
        </div>
      ))}
    </div>
  );
}
