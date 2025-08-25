"use client";

import { Button } from "@/components/ui/button";
import { Headset, LogOut, ScrollText } from "lucide-react";
import { signOut } from "next-auth/react";
import React, { MouseEvent } from "react";

export const Sidebar = ({ onClose }: { onClose?: () => void }) => {
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
      >
        <Headset />
        FAQ&apos;s
      </Button>
      <Button
        className="w-full justify-start"
        variant={"ghost"}
        onClick={() => onClose?.()}
      >
        <ScrollText />
        Policy
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
