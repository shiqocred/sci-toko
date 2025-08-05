// components/checkout/ProductCardDefault.tsx
import Image from "next/image";
import { formatRupiah, sizesImage } from "@/lib/utils";

interface Props {
  image: string | null;
  title: string;
  qty: string;
  price: string;
}

export function ProductCardDefault({ image, title, qty, price }: Props) {
  return (
    <div className="border rounded-md overflow-hidden flex">
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
      <div className="p-2 flex flex-col gap-2 text-sm flex-1">
        <p className="line-clamp-2 font-medium">{title}</p>
        <div className="flex items-center justify-between mt-auto">
          <p>{parseFloat(qty).toLocaleString()} x</p>
          <p className="font-semibold">{formatRupiah(price)}</p>
        </div>
      </div>
    </div>
  );
}
