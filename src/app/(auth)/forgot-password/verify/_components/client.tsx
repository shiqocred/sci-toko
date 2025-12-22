"use client";

import { Button } from "@/components/ui/button";
import React, {
  FormEvent,
  MouseEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useGetResend, useResendOTP, useVerify } from "../_api";
import { useSession } from "next-auth/react";
import { pronoun } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";

const Client = () => {
  const { update } = useSession();
  const searchParams = useSearchParams();
  const emailQuery = searchParams.get("email") ?? "";
  const [sendAgain, setSendAgain] = useState(0);
  const router = useRouter();

  const [input, setInput] = useState("");

  const { mutate: verify, isPending: isVerifying } = useVerify();
  const { mutate: resend, isPending: isResending } = useResendOTP();

  const { data, isPending } = useGetResend({ email: emailQuery });

  const loading = isVerifying || isResending || isPending;

  const resendAgain = useMemo(() => {
    return data?.data.resend ? new Date(data?.data.resend) : undefined;
  }, [data]);

  const handleResend = async (e: MouseEvent) => {
    e.preventDefault();

    resend({ body: { email: decodeURIComponent(emailQuery) } });
  };

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();

    verify(
      { body: { otp: input, email: decodeURIComponent(emailQuery) } },
      {
        onSuccess: async ({ data }) => {
          await update({ emailVerified: data.data.emailVerified });
        },
      }
    );
  };

  useEffect(() => {
    if (!resendAgain) return;

    const updateCountdown = () => {
      const now = Date.now();
      const target = resendAgain?.getTime();
      const diff = Math.max(0, Math.floor((target - now) / 1000));
      setSendAgain(diff);
    };

    updateCountdown(); // inisialisasi langsung

    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [resendAgain]);

  useEffect(() => {
    if (!emailQuery) {
      router.push("/forgot-password");
    }
  }, [emailQuery]);

  return (
    <div className="w-full bg-sky-50 relative h-full">
      <div
        className="min-[1440px]:h-[610px] w-full aspect-[1442/610] bg-repeat-x bg-[position:center_bottom] bg-[length:auto_100%] absolute top-0 z-0"
        style={{
          backgroundImage: "url('/assets/images/homepage.webp')",
        }}
      />
      <div className="w-full flex flex-col items-center py-20 md:py-32 relative z-10 px-4 md:px-0">
        <form
          onSubmit={handleVerify}
          className="max-w-md w-full p-5 bg-white rounded-2xl flex flex-col gap-5"
        >
          <div className="flex flex-col gap-1 text-center">
            <h1 className="text-2xl md:text-3xl font-bold">Get Your Code</h1>
            <p className="text-gray-500 text-sm md:text-base">
              We&apos;ve sent a verification code to your email. Please enter it
              below to Verify Your Account.
            </p>
          </div>
          <div className="flex justify-center w-full">
            <InputOTP
              value={input}
              onChange={(e) => setInput(e)}
              maxLength={6}
              disabled={loading}
            >
              {Array.from({ length: 6 }, (_, i) => (
                <InputOTPGroup key={i}>
                  <InputOTPSlot
                    className="border-gray-300 data-[active=true]:ring-0 data-[active=true]:border-gray-500 size-10"
                    index={i}
                  />
                </InputOTPGroup>
              ))}
            </InputOTP>
          </div>
          <Button
            type="submit"
            variant="destructive"
            className="border-gray-500 rounded-full"
            disabled={input.length < 6 || loading}
          >
            Verify and Proceed
          </Button>
          <div className="flex items-center gap-2 text-xs md:text-sm justify-center my-3">
            <p>Didn&apos;t receive the code?</p>
            <Button
              type="button"
              variant={"ghost"}
              className="hover:bg-transparent text-red-400 hover:text-red-500 p-0 h-auto disabled:opacity-70 hover:underline text-xs md:text-sm"
              onClick={handleResend}
              disabled={sendAgain > 0 || loading}
            >
              Resend{" "}
              {sendAgain > 0
                ? `in (${sendAgain}) Second${pronoun(sendAgain)}`
                : "OTP"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Client;
