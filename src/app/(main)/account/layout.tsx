import React, { ReactNode } from "react";
import { AlertVerification } from "./_components/alert-verification";
import { Sidebar } from "./_components/sidebar";
import { Navbar } from "./_components/navbar";
import { TopSidebar } from "./_components/top-sidebar";

const LayoutMainAccount = ({ children }: { children: ReactNode }) => {
  return (
    <div className="bg-sky-50 h-full">
      <div className="max-w-[1240px] mx-auto w-full flex flex-col gap-4 px-4 lg:px-8 py-4 md:py-6 lg:py-14">
        <AlertVerification />
        <div className="w-full grid grid-cols-3 gap-6">
          <div className="col-span-3 lg:col-span-1 w-full relative hidden lg:flex">
            <div className="flex flex-col gap-4 sticky top-4 w-full h-fit">
              <TopSidebar />
              <Sidebar />
            </div>
          </div>
          <div className="w-full col-span-3 lg:col-span-2 pb-20 md:pb-0">
            <div className="flex flex-col w-full rounded-lg overflow-hidden shadow-md">
              <Navbar className="hidden lg:flex" />
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LayoutMainAccount;
