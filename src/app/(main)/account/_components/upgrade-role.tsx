"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  BadgeCheck,
  ChevronRight,
  Loader,
  Stethoscope,
  Store,
} from "lucide-react";
import Link from "next/link";
import React from "react";
import { UserProps } from "../_api";
import { cn } from "@/lib/utils";

export const UpgradeRole = ({
  user,
  loading,
}: {
  user: UserProps | undefined;
  loading: boolean;
}) => {
  if (loading)
    return (
      <div className="rounded-lg shadow h-28 lg:h-[157px] flex flex-col justify-center items-center gap-1 bg-white text-sm">
        <Loader className="size-5 animate-spin" />
        <p className="ml-2 animate-pulse">Memuat...</p>
      </div>
    );

  if (user?.role !== "ADMIN" && user?.role !== "VETERINARIAN")
    return (
      <div className="lg:bg-white text-black items-center lg:shadow flex flex-col gap-3 p-3 lg:p-5 rounded-lg h-auto bg-sky-100">
        <div className="flex gap-3 w-full items-center">
          <BadgeCheck className="size-9 text-sky-100 lg:text-white fill-sky-500 flex-none" />
          <div className="flex flex-col w-full text-start md:gap-1">
            <h5 className="text-base font-semibold">Get a verified</h5>
            <p className="text-gray-700 md:text-gray-500 font-medium text-xs text-wrap">
              Upload required document to get exclusive deals
            </p>
          </div>
        </div>
        <Separator className="bg-gray-400 lg:bg-gray-300" />
        <div className="flex gap-2 w-full">
          {user?.role === "BASIC" && (
            <div className="relative w-full">
              <Button
                className="w-full flex-auto bg-sky-100 text-black border-black hover:bg-sky-200 lg:bg-transparent lg:text-green-500 lg:border-green-500 lg:hover:bg-green-100"
                size={"sm"}
                variant={"sciOutline"}
                asChild
              >
                <Link href={"/choose-role/pet-shop"}>
                  <Store />
                  Pet Shop
                  <ChevronRight />
                </Link>
              </Button>
              {user.newRole === "PETSHOP" && (
                <AnimatePing statusRole={user.statusRole} />
              )}
            </div>
          )}
          {(user?.role === "BASIC" || user?.role === "PETSHOP") && (
            <div className="relative w-full">
              <Button
                className="w-full flex-auto bg-sky-100 text-black border-black hover:bg-sky-200 lg:bg-transparent lg:text-green-500 lg:border-green-500 lg:hover:bg-green-100"
                size={"sm"}
                variant={"sciOutline"}
                asChild
              >
                <Link href={"/choose-role/veterinarian"}>
                  <Stethoscope />
                  Vet Clinic
                  <ChevronRight />
                </Link>
              </Button>
              {user.newRole === "VETERINARIAN" && (
                <AnimatePing statusRole={user.statusRole} />
              )}
            </div>
          )}
        </div>
      </div>
    );

  return null;
};

const AnimatePing = ({
  statusRole,
}: {
  statusRole: "PENDING" | "REJECTED" | "APPROVED" | null;
}) => {
  return (
    <div className="absolute -top-1 -right-1">
      <div className="relative flex items-center justify-center">
        <span
          className={cn(
            "absolute animate-ping rounded-full opacity-75 size-3",
            statusRole === "PENDING" && "bg-yellow-400",
            statusRole === "REJECTED" && "bg-red-400",
            statusRole === "APPROVED" && "bg-green-400"
          )}
        />
        <span
          className={cn(
            "relative inline-flex size-3 rounded-full",
            statusRole === "PENDING" && "bg-yellow-500",
            statusRole === "REJECTED" && "bg-red-500",
            statusRole === "APPROVED" && "bg-green-500"
          )}
        />
      </div>
    </div>
  );
};
