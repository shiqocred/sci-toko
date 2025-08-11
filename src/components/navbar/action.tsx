import React from "react";
import { LucideIcon, ShoppingCart, UserCircleIcon } from "lucide-react";

import { Button } from "../ui/button";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { auth } from "@/lib/auth";

export const Action = async () => {
  const isAuth = await auth();
  return (
    <div className="flex items-center gap-2">
      {/* login&register */}
      {!isAuth ? (
        <div className="flex items-center gap-2">
          <Button
            className="rounded-full flex-1"
            variant={"destructiveOutline"}
            asChild
          >
            <Link href={"/sign-in"}>Masuk</Link>
          </Button>
          <Button className="rounded-full flex-1" variant={"destructive"}>
            <Link href={"/sign-up"}>Daftar</Link>
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <ButtonIcon icon={ShoppingCart} href={"/cart"} />
          <ButtonIcon icon={UserCircleIcon} href={"/account/orders"} />
        </div>
      )}
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
    <Link href={href}>
      <Button
        size={"icon"}
        variant={"outline"}
        className={cn(
          "rounded-full border-0 shadow-none text-sci hover:text-sci hover:bg-sci/10",
          className
        )}
      >
        <Icon className="size-5" />
      </Button>
    </Link>
  );
};
