import React from "react";
import Client from "./_components/client";
import { Metadata } from "next";

export const metadata: Metadata = { title: "Verification Email" };

const VerificationEmailForgetPage = async () => {
  return (
    <div className="h-full">
      <Client />
    </div>
  );
};

export default VerificationEmailForgetPage;
