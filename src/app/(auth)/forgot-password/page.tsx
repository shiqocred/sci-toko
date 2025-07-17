import React from "react";
import Client from "./_components/client";
import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Forgot password" };

const ForgotPasswordPage = async () => {
  const isAuth = await auth();
  if (isAuth) redirect("/");

  return (
    <div className="h-full">
      <Client />
    </div>
  );
};

export default ForgotPasswordPage;
