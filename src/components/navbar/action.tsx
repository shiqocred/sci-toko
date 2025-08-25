"use client";

import React, { Dispatch, SetStateAction } from "react";
import {
  LogIn,
  LucideIcon,
  Menu,
  Search,
  ShoppingCart,
  UserCircleIcon,
} from "lucide-react";

import { Button } from "../ui/button";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { useSession } from "next-auth/react";

export const Action = ({
  search,
  setSearch,
  pathname,
  isMobile,
  setIsOpen,
}: {
  search: boolean;
  setSearch: Dispatch<SetStateAction<boolean>>;
  pathname: string;
  isMobile: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  const { status } = useSession();
  if (
    status === "loading" ||
    pathname === "/sign-in" ||
    pathname === "/sign-up" ||
    pathname.includes("/forgot-password")
  ) {
    return <div className="flex items-center gap-2"></div>;
  }
  if (status === "unauthenticated") {
    return (
      <div className="flex items-center gap-1 md:gap-2">
        {(pathname === "/" || pathname.includes("/products")) && (
          <Button
            className="md:hidden rounded-full text-sci hover:text-sci hover:bg-sci/10"
            variant={"ghost"}
            size={"icon"}
            onClick={() => setSearch(!search)}
            disabled={!isMobile}
          >
            <Search />
            <span className="sr-only">Search</span>
          </Button>
        )}
        <Button
          className="rounded-full text-red-500 hover:text-red-500 hover:bg-red-50 md:border md:border-red-500"
          variant={"ghost"}
          asChild
        >
          <Link href={"/sign-in"}>
            <p className="hidden md:flex">Sign In</p>
            <LogIn className="md:hidden" />
            <span className="sr-only">Login</span>
          </Link>
        </Button>
        <Button
          className="rounded-full flex-1 hidden lg:flex"
          variant={"destructive"}
          asChild
        >
          <Link href={"/sign-up"}>Daftar</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 md:gap-2">
      {(pathname === "/" || pathname.includes("/products")) && (
        <Button
          className="md:hidden rounded-full text-sci hover:text-sci hover:bg-sci/10"
          variant={"ghost"}
          size={"icon"}
          onClick={() => setSearch(!search)}
          disabled={!isMobile}
        >
          <Search className="size-5" />
          <span className="sr-only">Search</span>
        </Button>
      )}
      <ButtonIcon icon={ShoppingCart} href={"/cart"} />
      <Button
        className="lg:hidden rounded-full text-sci hover:text-sci hover:bg-sci/10"
        variant={"ghost"}
        size={"icon"}
        onClick={() => setIsOpen(true)}
      >
        <Menu className="size-5" />
        <span className="sr-only">Menu</span>
      </Button>
      <ButtonIcon
        className="hidden lg:flex"
        icon={UserCircleIcon}
        href={"/account/orders"}
      />
    </div>
  );
};

const ButtonIcon = ({
  href,
  className,
  icon: Icon,
}: {
  href: string;
  className?: string;
  icon: LucideIcon;
}) => {
  return (
    <Button
      size={"icon"}
      variant={"ghost"}
      className={cn(
        "rounded-full text-sci hover:text-sci hover:bg-sci/10",
        className
      )}
      asChild
    >
      <Link href={href}>
        <Icon className="size-5" />
      </Link>
    </Button>
  );
};
