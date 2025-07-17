import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import React, { MouseEvent } from "react";

export const ApprovedView = ({
  handleActivate,
}: {
  handleActivate: (e: MouseEvent) => Promise<void>;
}) => {
  return (
    <div className="max-w-md w-full p-5 bg-white rounded-2xl flex flex-col gap-1 text-center">
      <h1 className="text-3xl font-bold">
        Your account has been successfully verified.
      </h1>
      <CheckCircle className="size-14 text-green-500 mx-auto my-5" />
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
