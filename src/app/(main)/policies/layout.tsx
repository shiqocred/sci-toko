import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import React, { ReactNode } from "react";
import { SidebarPolicies } from "./_components/sidebar-policies";

const PoliciesLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="bg-sky-50 h-full">
      <div className="max-w-[1240px] mx-auto w-full flex flex-col gap-4 md:gap-7 px-4 lg:px-8 pt-10 md:pt-14 pb-24">
        <div className="flex items-center justify-between">
          <div className="flex items-center md:gap-2">
            <Button
              variant={"ghost"}
              size={"icon"}
              className="hover:bg-green-200"
            >
              <Link href={"/"}>
                <ArrowLeft className="size-5 stroke-2" />
              </Link>
            </Button>
            <h1 className="text-2xl md:text-3xl font-bold">Policies</h1>
          </div>
          <Button variant={"link"} asChild>
            <Link href={"/faqs"}>FAQ&apos;s</Link>
          </Button>
        </div>
        <div className="w-full grid lg:grid-cols-4 gap-4 lg:gap-6">
          <div className="col-span-1">
            <SidebarPolicies />
          </div>
          <div className="lg:col-span-3">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default PoliciesLayout;
