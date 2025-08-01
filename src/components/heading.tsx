import Link from "next/link";
import React from "react";

interface HeadingProps {
  label: string;
  isExpand?: string;
}

export const Heading = ({ label, isExpand }: HeadingProps) => {
  return (
    <div className="flex items-center gap-4">
      <h1 className="text-3xl font-bold">{label}</h1>
      {isExpand && (
        <Link
          href={isExpand}
          className="[--color:#009B4C] text-sm font-bold text-[var(--color)]"
        >
          SEE ALL
        </Link>
      )}
    </div>
  );
};
