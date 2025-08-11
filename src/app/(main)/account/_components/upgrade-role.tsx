"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { BadgeCheck, ChevronRight, Stethoscope, Store } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import React from "react";

export const UpgradeRole = () => {
  const { data } = useSession();
  const user = data?.user;
  if (user?.role !== "ADMIN" && user?.role !== "VETERINARIAN")
    return (
      <div className="bg-white text-black items-center shadow flex flex-col gap-3 p-5 rounded-lg h-auto">
        <div className="flex gap-3 w-full items-center">
          <BadgeCheck className="size-9 text-white fill-sky-500 flex-none" />
          <div className="flex flex-col w-full text-start gap-1">
            <h5 className="text-base font-semibold">Get a verified</h5>
            <p className="text-gray-500 text-xs text-wrap">
              Upload required document to get exclusive deals
            </p>
          </div>
        </div>
        <Separator />
        <div className="flex gap-2 w-full">
          {user?.role === "BASIC" && (
            <Button
              className="w-full flex-auto"
              size={"sm"}
              variant={"sciOutline"}
              asChild
            >
              <Link href={"/choose-role/pet-shop"}>
                <Store />
                Petshop
                <ChevronRight />
              </Link>
            </Button>
          )}
          {(user?.role === "BASIC" || user?.role === "PETSHOP") && (
            <Button
              className="w-full flex-auto"
              size={"sm"}
              variant={"sciOutline"}
              asChild
            >
              <Link href={"/choose-role/veterinarian"}>
                <Stethoscope />
                Veterinarian
                <ChevronRight />
              </Link>
            </Button>
          )}
        </div>
      </div>
    );

  return null;
};
