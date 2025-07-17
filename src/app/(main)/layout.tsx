import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import React from "react";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center bg-sky-50">
      <Navbar />
      <div className="h-full w-full">{children}</div>
      <Footer />
    </div>
  );
};

export default AuthLayout;
