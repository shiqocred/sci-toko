"use client";

import { Badge } from "@/components/ui/badge";
import { sizesImage } from "@/lib/utils";
import { TooltipText } from "@/providers/tooltip-provider";
import {
  CheckCircle,
  Crown,
  Loader,
  Stethoscope,
  Store,
  User2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { UserProps } from "../_api";

export const Profile = ({
  user,
  loading,
}: {
  user: UserProps | undefined;
  loading: boolean;
}) => {
  if (loading)
    return (
      <div className="rounded-lg shadow h-24 lg:h-[142px] flex flex-col justify-center items-center gap-1 bg-white text-sm">
        <Loader className="size-5 animate-spin" />
        <p className="ml-2 animate-pulse">Loading...</p>
      </div>
    );

  return (
    <div className="bg-white lg:shadow flex items-center gap-4 p-3 md:p-5 rounded-lg border lg:border-none border-gray-300">
      <div className="size-12 md:size-14 relative flex-none rounded-full overflow-hidden border bg-white">
        <Image
          fill
          src={user?.image ?? "/assets/images/logo-sci.png"}
          alt="profile"
          sizes={sizesImage}
          className="object-cover"
        />
      </div>
      <div className="flex flex-col gap-1 md:gap-2">
        <div className="flex flex-col w-full md:gap-1">
          <h5 className="md:text-lg font-semibold line-clamp-1">
            {user?.name}
          </h5>
          <div className="flex items-center gap-2">
            <p className="text-gray-500 text-sm text-wrap">{user?.email}</p>
            {user?.emailVerified && (
              <TooltipText value="Verified">
                <CheckCircle className="size-3 flex-none text-sci" />
              </TooltipText>
            )}
          </div>
        </div>
        {user?.role === "VETERINARIAN" && (
          <Badge
            className="bg-green-50 [a&]:hover:bg-green-100 border-green-600 text-green-600 rounded-full"
            asChild
          >
            <Link href={"/choose-role/veterinarian"}>
              <Stethoscope />
              <p>Vet Clinic</p>
            </Link>
          </Badge>
        )}
        {user?.role === "PETSHOP" && (
          <Badge
            className="bg-green-50 [a&]:hover:bg-green-100 border-green-600 text-green-600 rounded-full"
            asChild
          >
            <Link href={"/choose-role/pet-shop"}>
              <Store />
              <p>Pet Shop</p>
            </Link>
          </Badge>
        )}
        {user?.role === "BASIC" && (
          <Badge className="bg-green-50 hover:bg-green-50 border-green-600 text-green-600 rounded-full">
            <User2 />
            <p>Agent</p>
          </Badge>
        )}
        {user?.role === "ADMIN" && (
          <Badge className="bg-green-50 hover:bg-green-50 border-green-600 text-green-600 rounded-full">
            <Crown />
            <p>Admin</p>
          </Badge>
        )}
      </div>
    </div>
  );
};
