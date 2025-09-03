"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const data = [
  { label: "Privacy Policy", href: "/policies/privacy" },
  { label: "Refund Policy", href: "/policies/refund" },
  { label: "Terms of Use", href: "/policies/term-of-use" },
];

export const SidebarPolicies = () => {
  const pathname = usePathname();
  const router = useRouter();
  return (
    <div className="sticky top-4">
      <ul className="rounded-lg bg-white shadow-sm hidden lg:flex flex-col w-full">
        {data.map((item) => (
          <li key={item.href}>
            <Button
              variant={"link"}
              className={cn(
                "w-full justify-between h-12 rounded-none border-b",
                item.href === pathname && "underline"
              )}
              asChild
            >
              <Link href={item.href}>
                {item.label}
                <ChevronRight />
              </Link>
            </Button>
          </li>
        ))}
      </ul>
      <Select value={pathname} onValueChange={(e) => router.push(e)}>
        <SelectTrigger className="w-full bg-white shadow-sm border-0 lg:hidden">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="w-[var(--radix-popover-trigger-width)]">
          <SelectGroup>
            {data.map((item) => (
              <SelectItem key={item.href} value={item.href}>
                {item.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};
