import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogFooter,
  DialogTitle,
  DialogContent,
  DialogHeader,
  DialogDescription,
} from "@/components/ui/dialog";
import { Store } from "lucide-react";
import Link from "next/link";
import React, { Dispatch, SetStateAction } from "react";

export const DialogUnavailable = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: Dispatch<SetStateAction<boolean>>;
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Product Unavailable</DialogTitle>
          <DialogDescription>
            This product is currently out of stock. You can browse similar
            products on our shop page.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant={"destructive"}
            onClick={() => onOpenChange(false)}
            asChild
          >
            <Link href={"/products"}>
              <Store />
              Browse Other Products
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
