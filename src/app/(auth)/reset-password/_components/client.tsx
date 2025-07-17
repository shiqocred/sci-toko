"use client";

import { Button } from "@/components/ui/button";
import React, { ChangeEvent, FormEvent, useState } from "react";
import { useResetPassword } from "../_api";
import { PasswordInput } from "../../_components/form/password-input";
import { ConfirmPasswordInput } from "../../_components/form/confirm-password-input";
import { useSearchParams } from "next/navigation";

const Client = () => {
  const searchParams = useSearchParams();
  const tokenQuery = searchParams.get("token") ?? "";
  const token = decodeURIComponent(tokenQuery);
  const [input, setInput] = useState({ password: "", confirm_password: "" });

  const validations = [
    {
      label: "At least 8 characters",
      isValid: input.password.length >= 8,
    },
    {
      label: "At least 1 uppercase letter",
      isValid: /[A-Z]/.test(input.password),
    },
    {
      label: "At least 1 number",
      isValid: /\d/.test(input.password),
    },
    {
      label: "At least 1 symbol",
      isValid: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(input.password),
    },
  ];

  const allValid = validations.every((v) => v.isValid);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const v = e.target;

    setInput((prev) => ({ ...prev, [v.id]: v.value }));
  };

  const { mutate: resetPassword, isPending: resetingPassword } =
    useResetPassword();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    resetPassword({
      body: {
        password: input.password,
        confirm_password: input.confirm_password,
        token,
      },
    });
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
            <h1 className="text-3xl font-bold">Reset Password</h1>
            <p className="text-[:#707070]">
              Tap below to reset it and regain access to your account.
            </p>
          </div>
          <PasswordInput
            validations={validations}
            input={input}
            allValid={allValid}
            handleChange={handleChange}
            disabled={resetingPassword}
            isNewPassword
          />
          <ConfirmPasswordInput
            input={input}
            handleChange={handleChange}
            disabled={resetingPassword}
          />
          <Button
            type="submit"
            variant="destructive"
            className="border-gray-500 rounded-full"
            disabled={
              !input.password ||
              !input.confirm_password ||
              !allValid ||
              input.confirm_password !== input.password ||
              resetingPassword
            }
          >
            Change Password
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Client;
