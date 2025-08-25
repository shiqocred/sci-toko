import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import React from "react";
import { CartAction } from "../_section/_sub-sections/action";
import { ProductDetailProps } from "../../_api";

export const DrawerCart = ({
  open,
  onOpenChange,
  product,
  status,
  setIsDialog,
}: {
  open: boolean;
  onOpenChange: () => void;
  product?: ProductDetailProps;
  status: "authenticated" | "loading" | "unauthenticated";
  setIsDialog?: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <div className="z-10">
          <DrawerHeader className="p-0">
            <DrawerTitle></DrawerTitle>
            <DrawerDescription />
          </DrawerHeader>
          <div className="p-4">
            <CartAction
              setIsDialog={setIsDialog}
              product={product}
              status={status}
            />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
