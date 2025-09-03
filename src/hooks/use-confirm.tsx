"use client";

import { Button, type ButtonProps } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import React, { useState, JSX } from "react";
import { useIsMobile } from "./use-mobile";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

export const useConfirm = (
  title: string,
  message: string,
  variant: ButtonProps["variant"] = "default",
  confirmLabel?: string
): [() => JSX.Element, () => Promise<unknown>] => {
  const [promise, setPromise] = useState<{
    resolve: (value: boolean) => void;
  } | null>(null);

  const confirm = () => {
    return new Promise((resolve) => {
      setPromise({ resolve });
    });
  };

  const handleClose = () => {
    setPromise(null);
  };

  const handleConfirm = () => {
    promise?.resolve(true);
    handleClose();
  };

  const handleCancel = () => {
    promise?.resolve(false);
    handleClose();
  };

  const ConfirmationDialog = () => {
    const isMobile = useIsMobile();
    if (isMobile) {
      return (
        <Drawer open={promise !== null} onOpenChange={handleClose}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>{title}</DrawerTitle>
              <DrawerDescription>{message}</DrawerDescription>
            </DrawerHeader>
            <div className="w-full pt-4 flex items-center flex-col gap-y-2 lg:flex-row gap-x-2 justify-end p-5">
              <Button
                className="w-full lg:w-auto"
                variant={"outline"}
                onClick={handleCancel}
                type="button"
              >
                Cancel
              </Button>
              <Button
                className="w-full lg:w-auto"
                variant={variant}
                onClick={handleConfirm}
                type="button"
              >
                {confirmLabel ?? "Confirm"}
              </Button>
            </div>
          </DrawerContent>
        </Drawer>
      );
    }
    return (
      <Dialog open={promise !== null} onOpenChange={handleClose}>
        <DialogContent
          showCloseButton={false}
          className="w-[calc(100%-36px)] sm:max-w-lg border-none overflow-y-auto  hide-scrollbar max-w-[85vh]"
        >
          <DialogHeader className="p-0">
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{message}</DialogDescription>
          </DialogHeader>
          <div className="w-full pt-4 flex items-center flex-col gap-y-2 lg:flex-row gap-x-2 justify-end">
            <Button
              className="w-full lg:w-auto"
              variant={"outline"}
              onClick={handleCancel}
              type="button"
            >
              Cancel
            </Button>
            <Button
              className="w-full lg:w-auto"
              variant={variant}
              onClick={handleConfirm}
              type="button"
            >
              {confirmLabel ?? "Confirm"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return [ConfirmationDialog, confirm];
};
