"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";
import Image from "next/image";
import { sizesImage } from "@/lib/utils";
import { ArrowRight, PawPrintIcon, StethoscopeIcon } from "lucide-react";

const Client = () => {
  return (
    <div className="w-full bg-sky-50 relative h-full">
      <div
        className="min-[1440px]:h-[610px] w-full aspect-[1442/610] bg-repeat-x bg-[position:center_bottom] bg-[length:auto_100%] absolute top-0 z-0"
        style={{
          backgroundImage: "url('/assets/images/homepage.webp')",
        }}
      />
      <div className="w-full flex flex-col items-center py-32 relative z-10">
        <div className="max-w-md w-full p-5 bg-white rounded-2xl flex flex-col gap-4">
          <div className="flex flex-col gap-1 text-center">
            <h1 className="text-3xl font-bold">Registration Successful!</h1>
            <div className="size-20 relative mx-auto my-5">
              <Image
                src={"/assets/images/registration-successful.png"}
                alt="registration-successful"
                sizes={sizesImage}
                fill
                className="object-contain"
              />
            </div>
            <p className="text-[#707070]">
              Congratulations! Your account has been successfully registered.
              Please select your role to proceed with the verification process.
            </p>
          </div>
          <div className="flex w-full flex-col gap-2">
            <div className="flex items-center gap-2 w-full">
              <Button
                type="submit"
                variant="destructiveOutline"
                className="rounded-full w-full flex-auto"
                asChild
              >
                <Link href={"/choose-role/pet-shop"}>
                  <PawPrintIcon />
                  Pet Shop
                </Link>
              </Button>
              <Button
                type="submit"
                variant="destructive"
                className="rounded-full w-full flex-auto"
                asChild
              >
                <Link href={"/choose-role/veterinarian"}>
                  <StethoscopeIcon />
                  Veterinarian
                </Link>
              </Button>
            </div>
            <Button
              type="submit"
              variant="outline"
              className="border-gray-500 rounded-full w-full flex-auto"
              asChild
            >
              <Link href={"/"}>
                Skip
                <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Client;
