import React from "react";

import { Logo } from "./logo";
import { Search } from "./search";
import { Action } from "./action";

export const Navbar = () => {
  return (
    <div className="w-full bg-white">
      <div className="[--height-navbar:80px] [--max-width-nav:1240px] flex-none w-full h-[var(--height-navbar)] max-w-[var(--max-width-nav)] px-4 lg:px-8 flex items-center mx-auto">
        <Logo />
        <Search />
        <Action />
      </div>
    </div>
  );
};
