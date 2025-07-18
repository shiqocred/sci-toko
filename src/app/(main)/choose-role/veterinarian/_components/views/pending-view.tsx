import { Button } from "@/components/ui/button";
import { sizesImage } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export const PendingView = ({
  refetch,
  isRefetching,
}: {
  refetch: () => void;
  isRefetching: boolean;
}) => {
  return (
    <div className="max-w-md w-full p-5 bg-white rounded-2xl flex flex-col gap-1 text-center">
      <h1 className="text-3xl font-bold">Verifying</h1>
      <div className="mx-auto relative size-20 my-8">
        <Image
          src={"/assets/images/verify.png"}
          alt="verify"
          fill
          sizes={sizesImage}
          className="object-contain"
        />
      </div>
      <p className="text-[#707070] max-w-sm mx-auto">
        Verification may take up to 24 hours. We&apos;ll email you the result.
      </p>
      <Button
        onClick={() => refetch()}
        variant={"destructiveOutline"}
        className="rounded-full mt-5"
      >
        {isRefetching && <Loader2 className="animate-spin" />}
        Refresh{isRefetching && "ing..."}
      </Button>
      <Button variant={"destructive"} className="rounded-full mt-2" asChild>
        <Link href={"/"}>Go to Homepage</Link>
      </Button>
    </div>
  );
};
