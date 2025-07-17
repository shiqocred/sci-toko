import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import React from "react";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center">
      <Navbar />
      <div className="w-full h-full">{children}</div>
      <Footer />
    </div>
  );
};

export default MainLayout;
