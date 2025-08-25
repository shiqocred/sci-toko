import React from "react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "../ui/drawer";
import { TopSidebar } from "@/app/(main)/account/_components/top-sidebar";
import { Sidebar } from "@/app/(main)/account/_components/sidebar";
import { Navbar } from "@/app/(main)/account/_components/navbar";
import { Separator } from "../ui/separator";

export const DrawerMenu = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: () => void;
}) => {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <div className="z-10 w-full">
          <TopSidebar />
          <DrawerHeader className="pb-0 gap-0 max-w-md mx-auto w-full">
            <DrawerTitle className="text-xl text-start">Main Menu</DrawerTitle>
            <DrawerDescription />
          </DrawerHeader>
          <div className="flex flex-col overflow-y-auto pb-5">
            <div className="max-w-md mx-auto w-full">
              <Navbar onClose={onOpenChange} />
            </div>
            <Separator className="bg-gray-400" />
            <div className="max-w-md mx-auto w-full">
              <Sidebar onClose={onOpenChange} />
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
