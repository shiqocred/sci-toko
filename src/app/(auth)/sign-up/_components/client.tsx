"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn, numericString } from "@/lib/utils";
import Link from "next/link";
import React, { useState, ChangeEvent, FormEvent } from "react";
import { PasswordInput } from "../../_components/form/password-input";
import { ConfirmPasswordInput } from "../../_components/form/confirm-password-input";
import { PhoneNumberInput } from "./form/phone-number-input";
import { useRegister } from "../_api";
import { signIn } from "next-auth/react";

const initialValue = {
  name: "",
  email: "",
  password: "",
  confirm_password: "",
  phone_number: "",
};

const Client = () => {
  const [dialCode, setDialCode] = useState("+62");
  const [input, setInput] = useState(initialValue);
  const [errors, setErrors] = useState(initialValue);

  const { mutate: register, isPending: isRegistering } = useRegister();

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

  const handleChange = (
    e: ChangeEvent<HTMLInputElement>,
    isNumeric: boolean = false
  ) => {
    const v = e.target;

    setInput((prev) => ({
      ...prev,
      [v.id]: isNumeric ? numericString(v.value) : v.value,
    }));
  };

  const disabled =
    !input.email ||
    !allValid ||
    !input.name ||
    !input.phone_number ||
    input.password !== input.confirm_password;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    register(
      { body: input },
      {
        onSuccess: async () => {
          setInput(initialValue);
          setErrors(initialValue);
          await signIn("credentials", {
            email: input.email,
            password: input.password,
            redirect: true,
            redirectTo: "/verification-email",
          });
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
          className="max-w-md w-full p-5 bg-white rounded-2xl flex flex-col gap-6"
        >
          <h1 className="text-3xl font-bold w-full text-center mt-4">
            Create Account
          </h1>
          <div className="flex flex-col gap-4 w-full">
            <div className="flex flex-col gap-1.5 w-full">
              <Label htmlFor="name" className="required">
                Name
              </Label>
              <Input
                id="name"
                className={cn(
                  "bg-gray-100 border-gray-100 focus-visible:ring-0 focus-visible:border-gray-500",
                  errors.name && "border-red-500 focus-visible:border-red-500"
                )}
                placeholder="Type your name"
                onChange={handleChange}
                value={input.name}
                required
                disabled={isRegistering}
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5 w-full">
              <Label htmlFor="email" className="required">
                Email
              </Label>
              <Input
                id="email"
                className={cn(
                  "bg-gray-100 border-gray-100 focus-visible:ring-0 focus-visible:border-gray-500",
                  errors.email && "border-red-500 focus-visible:border-red-500"
                )}
                placeholder="Type your email"
                type="email"
                onChange={handleChange}
                value={input.email}
                required
                disabled={isRegistering}
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email}</p>
              )}
            </div>
            <PasswordInput
              validations={validations}
              input={input}
              allValid={allValid}
              handleChange={handleChange}
              disabled={isRegistering}
              errors={errors}
            />
            <ConfirmPasswordInput
              input={input}
              handleChange={handleChange}
              disabled={isRegistering}
              errors={errors}
            />
            <PhoneNumberInput
              input={input}
              handleChange={handleChange}
              dialCode={dialCode}
              setDialCode={setDialCode}
              disabled={isRegistering}
            />
          </div>
          <Button
            type="submit"
            variant="destructive"
            className="border-gray-500 rounded-full"
            disabled={disabled || isRegistering}
          >
            Sign Up
          </Button>
          <p className="text-sm text-center text-gray-500">
            Already have an account{" "}
            <Link
              href="/sign-in"
              className="underline underline-offset-2 text-red-500 font-semibold text-sm"
            >
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Client;
