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
}

export const Sosmed = ({ data }: { data: SosmedProps[] }) => {
  return (
    <div className="flex flex-col gap-4 lg:gap-12 w-fit">
      <Link
        href={"/"}
        className="w-[100px] md:w-[150px] aspect-[150/57] relative flex-none"
      >
        <Image
          alt="Logo SCI"
          src={"/assets/images/logo-sci.png"}
          fill
          className="object-contain object-center"
          sizes={sizesImage}
        />
      </Link>
      <div className="flex gap-4 items-center justify-between">
        {data.map((item) => (
          <Button
            key={item.title}
            className="[--color:#FF1E1B] text-white size-10 rounded-full bg-[var(--color)] hover:bg-red-600"
            size={"icon"}
          >
            <item.icon className={cn("size-5", item.className)} />
            <span className="sr-only">{item.title}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};
