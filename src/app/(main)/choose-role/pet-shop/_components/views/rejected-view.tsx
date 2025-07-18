import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import React, { MouseEvent } from "react";

export const RejectedView = ({
  message,
  handleReset,
  isReseting,
}: {
  message: string | null;
  handleReset: (e: MouseEvent) => void;
  isReseting: boolean;
}) => {
  return (
    <div className="max-w-md w-full p-5 bg-white rounded-2xl flex flex-col gap-1 text-center">
      <h1 className="text-3xl font-bold">Verification request declined</h1>
      <AlertCircle className="size-14 text-red-500 mx-auto my-5" />
      <p className="w-full bg-gray-200 rounded-md mb-3 py-2">
        &quot;{message}&quot;
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant={"destructiveOutline"}
          className="rounded-full w-full flex-auto"
          asChild
          disabled={isReseting}
        >
          <Link href={"/"}>Go to Homepage</Link>
        </Button>
        <Button
          onClick={handleReset}
          variant={"destructive"}
          className="rounded-full w-full flex-auto cursor-pointer"
          disabled={isReseting}
        >
          {isReseting && <Loader2 className="animate-spin" />}
          {isReseting ? "Reseting Form..." : "Apply again"}
        </Button>
      </div>
    </div>
  );
};
