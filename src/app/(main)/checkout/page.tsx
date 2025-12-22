import React from "react";
import Client from "./_components/client";
import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { isDraftOrderExist } from "@/lib/api/checkout";

export const metadata: Metadata = {
  title: "Checkout",
};

const CheckoutPage = async () => {
  const isAuth = await auth();
  if (!isAuth) redirect("/sign-in");
  const isExist = await isDraftOrderExist(isAuth.user.id);

  if (!isExist) redirect("/cart");
  return (
    <div className="h-full">
      <Client />
    </div>
  );
};

export default CheckoutPage;
