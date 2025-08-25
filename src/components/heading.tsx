import Link from "next/link";
import React from "react";
import { Button } from "./ui/button";

interface HeadingProps {
  label: string;
  isExpand?: string;
}

export const Heading = ({ label, isExpand }: HeadingProps) => {
  return (
    <div className="flex items-center justify-between gap-4">
      <h1 className="text-xl md:text-2xl lg:text-3xl font-bold">{label}</h1>
      {isExpand && (
        <Button
          asChild
          variant={"sciOutline"}
          className="bg-transparent text-xs md:text-sm font-semibold h-fit py-1 rounded-full px-3 shadow-none"
        >
          <Link href={isExpand}>All Products</Link>
        </Button>
      )}
    </div>
  );
};
