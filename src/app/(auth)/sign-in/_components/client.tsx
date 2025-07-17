"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

const initialValue = {
  email: "",
  password: "",
};

const Client = () => {
  const searchParams = useSearchParams();
  const redirectURL = searchParams.get("redirect");

  const [input, setInput] = useState(initialValue);
  const [isVisible, setIsVisible] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const v = e.target;
    setInput((prev) => ({ ...prev, [v.id]: v.value }));
  };

  const credentialsAction = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await signIn("credentials", {
        ...input,
        redirect: true,
        redirectTo: redirectURL ?? "/",
      });
    } catch (error) {
      toast.error("Invalid Credentials");
      console.log("ERROR_LOGIN:", error);
    }
  };

  useEffect(() => {
    const error = searchParams.get("error");
    const code = searchParams.get("code");

    if (error === "CredentialsSignin" && code === "credential_not_match") {
      toast.error("Email atau password tidak cocok");

      // Menghapus query parameter tanpa reload
      const newParams = new URLSearchParams(window.location.search);
      newParams.delete("error");
      newParams.delete("code");

      if (typeof window !== "undefined") {
        const baseUrl = window.location.origin + window.location.pathname;
        const rest = newParams.toString();
        const cleanUrl = rest ? `${baseUrl}?${rest}` : baseUrl;
        window.history.replaceState(null, "", cleanUrl);
      }
    }
  }, [searchParams]);

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
          onSubmit={credentialsAction}
          className="max-w-md w-full p-5 bg-white rounded-2xl flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1 text-center">
            <h1 className="text-3xl font-bold">Sign In</h1>
            <p className="text-[:#707070]">Hi, welcome back</p>
          </div>
          <div className="flex flex-col gap-1.5 w-full">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              className="bg-gray-100 border-gray-100 focus-visible:ring-0 focus-visible:border-gray-500"
              placeholder="Type your email"
              type="email"
              onChange={handleChange}
              value={input.email}
              autoFocus
            />
          </div>
          <div className="flex flex-col gap-1.5 w-full">
            <Label htmlFor="password">Password</Label>
            <div className="relative flex items-center">
              <Input
                id="password"
                className="bg-gray-100 border-gray-100 focus-visible:ring-0 focus-visible:border-gray-500"
                placeholder="Type your password"
                type={isVisible ? "text" : "password"}
                onChange={handleChange}
                value={input.password}
              />
              <Button
                type="button"
                className="absolute right-2 size-6 hover:bg-gray-200"
                size={"icon"}
                variant={"ghost"}
                onClick={() => setIsVisible(!isVisible)}
              >
                {isVisible ? <EyeOff /> : <Eye />}
              </Button>
            </div>
          </div>
          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="underline underline-offset-2 text-red-500 font-semibold text-sm"
            >
              Forgot Password?
            </Link>
          </div>
          <Button
            type="submit"
            variant="destructive"
            className="border-gray-500 rounded-full"
            disabled={!input.email || !input.password}
          >
            Sign In
          </Button>
          <p className="text-sm text-center text-gray-500">
            Don&apos;t have an account{" "}
            <Link
              href="/sign-up"
              className="underline underline-offset-2 text-red-500 font-semibold text-sm"
            >
              Sign Up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Client;
