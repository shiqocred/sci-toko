import React from "react";
import Client from "./_components/client";
import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Pet shop form" };

const PetShopFormPage = async () => {
  const isAuth = await auth();
  if (!isAuth) redirect("/sign-in");
  if (isAuth && !isAuth.user.emailVerified) redirect("/verification-email");

  return (
    <div className="h-full">
      <Client />
    </div>
  );
};

export default PetShopFormPage;
