import React from "react";
import Client from "./_components/client";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

const AccountTrackOrderPage = async () => {
  const isAuth = await auth();
  if (!isAuth) redirect("/sign-in");
  return (
    <div className="h-full">
      <Client />
    </div>
  );
};

export default AccountTrackOrderPage;
