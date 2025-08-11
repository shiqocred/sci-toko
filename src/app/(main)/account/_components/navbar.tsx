"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const data = [
  { label: "My Order", href: "/account/orders" },
  { label: "Basic Profile", href: "/account/profile" },
  { label: "Change Password", href: "/account/password" },
  { label: "Shipping Address", href: "/account/addresses" },
];

export const Navbar = () => {
  const pathname = usePathname();
  return (
    <div className="flex items-center w-full gap-1 *:w-full *:h-12 *:flex-auto *:rounded-none *:shadow-none *:text-gray-500 *:bg-white *:hover:bg-green-50 *:hover:text-green-600 *:border-0 *:border-b-2 *:border-gray-300">
      {data.map((item) => (
        <Button key={item.href} asChild>
          <Link
            href={item.href}
            className={cn(
              pathname.includes(item.href) &&
                "!border-green-600 !text-green-600 hover:!bg-green-50 !shadow-none"
            )}
          >
            {item.label}
          </Link>
        </Button>
      ))}
    </div>
  );
};
