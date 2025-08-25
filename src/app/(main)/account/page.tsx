import { auth } from "@/lib/auth";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Account",
};

const AccountPage = async () => {
  const isAuth = await auth();
  if (!isAuth) redirect("/sign-in");
  redirect("/account/orders");
};

export default AccountPage;
