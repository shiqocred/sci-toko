import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogFooter,
  DialogTitle,
  DialogContent,
  DialogHeader,
  DialogDescription,
} from "@/components/ui/dialog";
import { ShoppingCart, Undo2 } from "lucide-react";
import Link from "next/link";
import React from "react";

export const DialogAddedToCart = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: () => void;
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Product Added to Cart</DialogTitle>
          <DialogDescription>
            You&apos;ve successfully added this item to your cart. What would
            you like to do next?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant={"destructiveOutline"} onClick={onOpenChange}>
            <Undo2 />
            Continue Shopping
          </Button>
          <Button variant={"destructive"} asChild>
            <Link href={"/cart"}>
              <ShoppingCart />
              View Cart
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
