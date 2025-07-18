import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sizesImage } from "@/lib/utils";
import { CheckCircle } from "lucide-react";
import Image from "next/image";
import React, { MouseEvent } from "react";

export const ApprovedView = ({
  handleActivate,
  data,
}: {
  handleActivate: (e: MouseEvent) => Promise<void>;
  data: {
    status: "PENDING" | "APPROVED" | "REJECTED" | null;
    name: string | null;
    role: "BASIC" | "PETSHOP" | "VETERINARIAN" | "ADMIN";
    message: string | null;
    fileKtp: string | null;
    storefront: string | null;
    nik: string | null;
  };
}) => {
  return (
    <div className="max-w-md w-full p-5 bg-white rounded-2xl flex flex-col gap-4 text-center">
      <CheckCircle className="size-12 text-green-500 mx-auto mt-3" />
      <h1 className="text-3xl font-bold">
        Your account has been successfully verified.
      </h1>
      <div className="flex flex-col gap-4">
        {[
          { label: "Full Name", value: data.name ?? "" },
          { label: "NIK", value: data.nik ?? "" },
        ].map((item) => (
          <div key={item.label} className="flex flex-col gap-1.5 w-full">
            <Label>{item.label}</Label>
            <Input
              defaultValue={item.value}
              className="bg-gray-100 border-gray-100 disabled:opacity-100"
              disabled
            />
          </div>
        ))}
        <div className="flex flex-col gap-1.5 w-full">
          <Label>KTP</Label>
          <div className="w-full aspect-[107/67] border border-gray-400 rounded-md overflow-hidden relative">
            <Image
              src={data.fileKtp ?? ""}
              alt="Foto KTP"
              fill
              sizes={sizesImage}
              className="object-cover"
            />
          </div>
        </div>
        <div className="flex flex-col gap-1.5 w-full">
          <Label>Photo of Your Pet Shop Building</Label>
          <div className="w-full aspect-[107/67] border border-gray-400 rounded-md overflow-hidden relative">
            <Image
              src={data.storefront ?? ""}
              alt="Foto Storefront"
              fill
              sizes={sizesImage}
              className="object-cover"
            />
          </div>
        </div>
      </div>
      <Button
        variant={"destructive"}
        onClick={handleActivate}
        className="rounded-full"
      >
        Continue
      </Button>
    </div>
  );
};
