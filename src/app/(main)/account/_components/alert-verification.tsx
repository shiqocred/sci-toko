"use client";

import { Button } from "@/components/ui/button";
import { Loader2, MailWarning } from "lucide-react";
import React, { MouseEvent } from "react";
import { useGetUser, useSendOTP } from "../_api";
import { useRouter } from "next/navigation";

export const AlertVerification = () => {
  const router = useRouter();
  const { mutate: sendOTP, isPending: isSendingOTP } = useSendOTP();
  const { data } = useGetUser();

  const handleSendOTP = (e: MouseEvent) => {
    e.preventDefault();
    sendOTP(
      {},
      {
        onSuccess: () => {
          router.push("/verification-email?from=account");
        },
      }
    );
  };

  if (!data?.data.emailVerified)
    return (
      <div className="w-full flex items-center gap-4 justify-between bg-yellow-100 rounded-lg p-3">
        <div className="flex items-center gap-2">
          <div className="size-8 flex items-center justify-center rounded-full bg-yellow-200">
            <MailWarning className="size-5" />
          </div>
          <p className="text-sm font-medium">
            Email verification is required to unlock all features.
          </p>
        </div>
        <Button
          size={"sm"}
          variant={"outline"}
          className="bg-transparent border-gray-700 hover:bg-yellow-200 text-xs font-medium"
          onClick={handleSendOTP}
          disabled={isSendingOTP}
        >
          {isSendingOTP && <Loader2 className="animate-spin" />}
          Verify{isSendingOTP}
        </Button>
      </div>
    );
  return null;
};
