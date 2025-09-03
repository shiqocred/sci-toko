"use client";

import { Button } from "@/components/ui/button";
import {
  Headset,
  LogOut,
  MessageSquareMoreIcon,
  ScrollText,
} from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import React, { MouseEvent, useMemo } from "react";
import { useGetContact } from "../_api";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export const Sidebar = ({ onClose }: { onClose?: () => void }) => {
  const pathname = usePathname();
  const { data: contact } = useGetContact();
  const contactUrl = useMemo(() => contact?.data ?? "", [contact]);
  const handleLogout = async (e: MouseEvent) => {
    e.preventDefault();
    await signOut({ redirect: true, redirectTo: "/" });
  };
  return (
    <div className="bg-white text-black items-center lg:shadow flex flex-col gap-1 p-3 rounded-lg h-auto">
      <Button
        className="w-full justify-start"
        variant={"ghost"}
        onClick={() => onClose?.()}
        asChild
      >
        <Link href={contactUrl} target="_blank">
          <Headset />
          Contact Us
        </Link>
      </Button>
      <Button
        className={cn(
          "w-full justify-start",
          pathname.includes("/faqs") &&
            "!border-green-600 !text-green-600 hover:!bg-green-50 !shadow-none"
        )}
        variant={"ghost"}
        onClick={() => onClose?.()}
        asChild
      >
        <Link href={"/faqs"}>
          <MessageSquareMoreIcon />
          FAQ&apos;s
        </Link>
      </Button>
      <Button
        className={cn(
          "w-full justify-start",
          pathname.includes("/policies") &&
            "!border-green-600 !text-green-600 hover:!bg-green-50 !shadow-none"
        )}
        variant={"ghost"}
        onClick={() => onClose?.()}
        asChild
      >
        <Link href={"/policies/privacy"}>
          <ScrollText />
          Policies
        </Link>
      </Button>
      <Button
        className="w-full text-red-400 hover:bg-red-50 hover:text-red-500 justify-start"
        variant={"ghost"}
        onClick={handleLogout}
      >
        <LogOut />
        Logout
      </Button>
    </div>
  );
};
