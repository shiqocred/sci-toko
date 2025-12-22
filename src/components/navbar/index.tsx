"use client";

import React, { useEffect, useState } from "react";

import { Logo } from "./logo";
import { Search } from "./search";
import { Action } from "./action";
import { SearchMobile } from "./search-mobile";
import { usePathname, useSearchParams } from "next/navigation";
import { useIsMobile } from "@/hooks/use-mobile";
import { DrawerMenu } from "./drawer-menu";

export const Navbar = () => {
  const [search, setSearch] = useState(false);
  const q = useSearchParams().get("q");
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setSearch(Boolean(q));
  }, [q]);

  return (
    <div className="w-full bg-white">
      <DrawerMenu
        open={isOpen}
        onOpenChange={() => {
          if (isOpen) {
            setIsOpen(false);
          }
        }}
      />
      <div className="flex-none w-full max-w-[1240px] py-3 gap-4 md:py-4 flex-col px-4 lg:px-8 flex items-center mx-auto border-b">
        <div className="flex w-full">
          <Logo />
          <Search pathname={pathname} isMobile={isMobile} />
          <Action
            setSearch={setSearch}
            search={search}
            pathname={pathname}
            isMobile={isMobile}
            setIsOpen={setIsOpen}
          />
        </div>
        <SearchMobile search={search} pathname={pathname} isMobile={isMobile} />
      </div>
    </div>
  );
};
