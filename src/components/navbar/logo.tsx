import React from "react";
import Image from "next/image";
import { sizesImage } from "@/lib/utils";
import Link from "next/link";

export const Logo = () => {
  return (
    <Link href={"/"} className="flex-none w-[130px] md:w-[165px] aspect-[23/5]">
      <div className="size-full relative overflow-hidden">
        <Image
          alt="Logo SCI"
          src={"/assets/images/logo-brand.png"}
          fill
          className="object-center object-contain"
          sizes={sizesImage}
          priority
        />
      </div>
    </Link>
  );
};
