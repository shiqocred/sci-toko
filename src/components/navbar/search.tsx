"use client";

import React from "react";
import { InputSearch } from "./input-search";

export const Search = ({
  pathname,
  isMobile,
}: {
  pathname: string;
  isMobile: boolean;
}) => {
  if ((pathname === "/" || pathname.includes("/products")) && !isMobile)
    return (
      <div className="w-full mx-4 md:mx-8 lg:mx-12 flex items-center justify-center">
        <InputSearch pathname={pathname} />
      </div>
    );

  return <div className="w-full mx-4 md:mx-8 lg:mx-12" />;
};
