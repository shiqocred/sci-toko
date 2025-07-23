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
  id: string;
  title: string;
  description: string;
  image: string;
}

export const ProductCard = ({
  id,
  title,
  description,
  image,
}: ProductCardProps) => {
  return (
    <Link href={`/products/${id}`}>
      <Card className="p-0 overflow-hidden gap-0 rounded-xl shadow">
        <CardHeader className="w-full aspect-4/3 relative p-0 overflow-hidden">
          <Image
            alt={title}
            src={image}
            fill
            className="object-cover"
            sizes={sizesImage}
          />
        </CardHeader>
        <Separator />
        <CardContent className="p-2.5 w-full flex flex-col gap-3">
          <CardTitle>{title}</CardTitle>
          <CardDescription className="line-clamp-2">
            {description}
          </CardDescription>
          <div className="flex items-center gap-3">
            <StarIcon className="[--color-star:#FFC403] size-3 text-[var(--color-star)] fill-[var(--color-star)]" />
            <div className="[--color:#746D76] text-xs flex items-center text-[var(--color)]">
              <p>{100}</p>
              <Separator
                className="[--color:#746D76] mx-1.5 !h-3.5 flex-none bg-[var(--color)]"
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
