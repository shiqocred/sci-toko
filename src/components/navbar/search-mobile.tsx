"use client";

import React from "react";
import { InputSearch } from "./input-search";

export const SearchMobile = ({
  search,
  pathname,
  isMobile,
}: {
  search: boolean;
  pathname: string;
  isMobile: boolean;
}) => {
  if (
    (pathname === "/" || pathname.includes("/products")) &&
    isMobile &&
    search
  )
    return (
      <div className="w-full flex items-center justify-center">
        <InputSearch pathname={pathname} />
      </div>
    );

  return null;
};
