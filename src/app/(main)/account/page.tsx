import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

const AccountPage = async () => {
  const isAuth = await auth();
  if (!isAuth) redirect("/sign-in");
  redirect("/account/orders");
};

export default AccountPage;
