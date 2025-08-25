import React from "react";
import Client from "./_components/client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cart",
};

const CartPage = () => {
  return (
    <div className="h-full">
      <Client />
    </div>
  );
};

export default CartPage;
