import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { sizesImage } from "@/lib/utils";
import { StarIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface ProductCardProps {
  title: string;
  slug: string;
  description: string;
  image: string | null;
}

export const ProductCard = ({
  title,
  slug,
  description,
  image,
}: ProductCardProps) => {
  return (
    <Link
      href={`/products/${encodeURIComponent(slug)}`}
      className="group h-full"
    >
      <Card className="p-0 overflow-hidden gap-0 rounded-xl shadow h-full">
        <CardHeader className="w-full aspect-4/3 relative p-0 overflow-hidden flex-none">
          <Image
            alt={title}
            src={image ?? "/assets/images/logo-sci.png"}
            fill
            className="object-cover group-hover:scale-105 transition-all"
            sizes={sizesImage}
          />
        </CardHeader>
        <Separator />
        <CardContent className="p-2.5 w-full flex flex-col gap-3 h-full">
          <CardTitle className="leading-tight text-sm line-clamp-2">
            {title}
          </CardTitle>
          <CardDescription className="line-clamp-3 text-xs leading-relaxed">
            {description}
          </CardDescription>
          <div className="flex items-center gap-3 mt-auto">
            <StarIcon className="size-3 text-[#FFC403] fill-[#FFC403]" />
            <div className="text-xs flex items-center text-[#746D76]">
              <p>{100}</p>
              <Separator
                className="mx-1.5 !h-3.5 flex-none bg-[#746D76]"
                orientation="vertical"
              />
              <p>{(100).toLocaleString()} Sold</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
