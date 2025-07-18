"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import React, { FormEvent, useState } from "react";
import { useSendOTP } from "../_api";
import { cn } from "@/lib/utils";

const Client = () => {
  const [input, setInput] = useState("");
  const [errors, setErrors] = useState({ email: "" });

  const { mutate: sendOTP, isPending: sendingOTP } = useSendOTP();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    sendOTP(
      { body: { email: input } },
      {
        onSuccess: () => {
          setInput("");
          setErrors({ email: "" });
        },
        onError: (err) => {
          setErrors((err.response?.data as any).errors);
        },
      }
    );
  };

  return (
    <div className="w-full bg-sky-50 relative h-full">
      <div
        className="min-[1440px]:h-[610px] w-full aspect-[1442/610] bg-repeat-x bg-[position:center_bottom] bg-[length:auto_100%] absolute top-0 z-0"
        style={{
          backgroundImage: "url('/assets/images/homepage.webp')",
        }}
      />
      <div className="w-full flex flex-col items-center py-32 relative z-10">
        <form
          onSubmit={handleSubmit}
          className="max-w-md w-full p-5 bg-white rounded-2xl flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1 text-center">
            <h1 className="text-3xl font-bold">Forgot Password?</h1>
            <p className="text-[:#707070]">
              No worries — enter your email to reset it.
            </p>
          </div>
          <div className="flex flex-col gap-1.5 w-full">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              className={cn(
                "bg-gray-100 border-gray-100 focus-visible:ring-0 focus-visible:border-gray-500",
                errors.email && "border-red-500 focus-visible:border-red-500"
              )}
              placeholder="Type your email"
              type="email"
              onChange={(e) => setInput(e.target.value)}
              value={input}
              autoFocus
              disabled={sendingOTP}
            />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email}</p>
            )}
          </div>
          <Button
            type="submit"
            variant="destructive"
            className="border-gray-500 rounded-full"
            disabled={!input || sendingOTP}
          >
            Send code
          </Button>
          <div className="flex flex-col gap-1 items-center">
            <p className="text-sm text-center text-gray-500">
              Remember your password?{" "}
              <Link
                href="/sign-in"
                className="underline underline-offset-2 text-red-500 font-semibold text-sm"
              >
                Sign In
              </Link>
            </p>
            <p className="text-sm text-center text-gray-500">
              Need create an account{" "}
              <Link
                href="/sign-up"
                className="underline underline-offset-2 text-red-500 font-semibold text-sm"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Client;
