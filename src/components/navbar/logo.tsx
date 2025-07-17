import React from "react";
import Image from "next/image";
import { sizesImage } from "@/lib/utils";
import Link from "next/link";

export const Logo = () => {
  return (
    <Link
      href={"/"}
      className="[--width-logo:100px] [--height-logo:38px] h-[var(--height-logo)] w-[var(--width-logo)]"
    >
      <div className="size-full relative">
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
