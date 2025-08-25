"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LockKeyholeIcon, MapIcon, PackageIcon, User2Icon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const data = [
  { icon: PackageIcon, label: "My Order", href: "/account/orders" },
  { icon: User2Icon, label: "Change Profile", href: "/account/profile" },
  {
    icon: LockKeyholeIcon,
    label: "Change Password",
    href: "/account/password",
  },
  { icon: MapIcon, label: "Shipping Address", href: "/account/addresses" },
];

export const Navbar = ({
  className,
  onClose,
}: {
  className?: string;
  onClose?: () => void;
}) => {
  const pathname = usePathname();
  return (
    <div
      className={cn(
        "flex flex-col lg:flex-row items-center w-full gap-1 p-3 lg:p-0 *:w-full *:lg:h-12 *:flex-auto *:lg:rounded-none *:shadow-none *:text-black *:lg:text-gray-500 *:bg-white *:hover:bg-green-50 *:hover:text-green-600 *:border-0 *:lg:border-b-2 *:border-gray-300 *:justify-start *:lg:justify-center",
        className
      )}
    >
      {data.map((item) => (
        <Button key={item.href} asChild onClick={() => onClose?.()}>
          <Link
            href={item.href}
            className={cn(
              pathname.includes(item.href) &&
                "!border-green-600 !text-green-600 hover:!bg-green-50 !shadow-none"
            )}
          >
            <item.icon className="lg:hidden" />
            {item.label}
          </Link>
        </Button>
      ))}
    </div>
  );
};
