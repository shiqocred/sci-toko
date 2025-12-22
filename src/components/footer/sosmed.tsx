import React from "react";
import Link from "next/link";
import Image from "next/image";
import { LucideIcon } from "lucide-react";

import { Button } from "../ui/button";

import { cn, sizesImage } from "@/lib/utils";

interface SosmedProps {
  title: string;
  icon: LucideIcon;
  className: string;
  href: string;
}

export const Sosmed = ({ data }: { data: SosmedProps[] }) => {
  return (
    <div className="flex flex-col gap-4 lg:gap-6 w-fit">
      <Link
        href={"/"}
        className="w-[200px] md:w-[250px] aspect-[23/5] relative flex-none"
      >
        <Image
          alt="Logo SCI"
          src={"/assets/images/logo-brand.png"}
          fill
          className="object-contain object-center"
          sizes={sizesImage}
          loading="eager"
        />
      </Link>
      <div className="flex gap-2 md:gap-4 items-center">
        {data.map((item) => (
          <Button
            key={item.title}
            className="text-white size-8 md:size-10 rounded-full bg-[#FF1E1B] hover:bg-red-600"
            size={"icon"}
            asChild
          >
            <Link href={item.href}>
              <item.icon className={cn("size-3.5 md:size-5", item.className)} />
              <span className="sr-only">{item.title}</span>
            </Link>
          </Button>
        ))}
      </div>
    </div>
  );
};
