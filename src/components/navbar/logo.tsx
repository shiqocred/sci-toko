import React from "react";
import Image from "next/image";
import { sizesImage } from "@/lib/utils";
import Link from "next/link";

export const Logo = () => {
  return (
    <Link href={"/"} className="flex-none w-[60px] md:w-[80px] aspect-[100/38]">
      <div className="size-full relative overflow-hidden">
        <Image
          alt="Logo SCI"
          src={"/assets/images/logo-sci.png"}
          fill
          className="object-center object-contain"
          sizes={sizesImage}
          priority
        />
      </div>
    </Link>
  );
};
