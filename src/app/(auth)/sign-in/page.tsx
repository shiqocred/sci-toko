import React from "react";
import Client from "./_components/client";
import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Sign in" };

const SignInPage = async () => {
  const isAuth = await auth();
  if (isAuth && !isAuth.user.emailVerified) redirect("/verification-email");
  if (isAuth && isAuth.user.emailVerified) redirect("/");

  return (
    <div className="h-full">
      <Client />
    </div>
  );
};

export default SignInPage;
