import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Policies",
};

const PoliciesPage = () => {
  redirect("/policies/privacy");
};

export default PoliciesPage;
