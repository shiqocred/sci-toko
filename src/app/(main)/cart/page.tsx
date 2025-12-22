import React from "react";
import Client from "./_components/client";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Cart",
};

const CartPage = async () => {
  const isAuth = await auth();
  if (!isAuth) redirect("/sign-in");
  return (
    <div className="h-full">
      <Client />
    </div>
  );
};

export default CartPage;
