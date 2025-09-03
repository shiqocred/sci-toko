import React from "react";
import { Client } from "./_components/client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

const PrivacyPolicyPage = () => {
  return (
    <div className="h-full">
      <Client />
    </div>
  );
};

export default PrivacyPolicyPage;
