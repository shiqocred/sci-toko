"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogFooter,
  DialogTitle,
  DialogContent,
  DialogHeader,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Edit, Loader, LocateOff, PlusCircle } from "lucide-react";
import { MouseEvent, useState } from "react";
import { useGetAddress, useSelectedAddress } from "../../_api";
import {
  useAddAddress,
  useUpdateAddress,
} from "@/app/(main)/account/addresses/_api";
import { FormSection } from "./form";

export type AddAddressType = ReturnType<typeof useAddAddress>["mutate"];
export type UpdateAddressType = ReturnType<typeof useUpdateAddress>["mutate"];
export type GetAddressType = ReturnType<typeof useGetAddress>["data"];

export const DialogSelectAddress = ({
  open,
  onOpenChange,
  listAddresses,
  addressId,
}: {
  open: boolean;
  onOpenChange: () => void;
  listAddresses:
    | {
        id: string;
        name: string;
        detail: string | null;
        isDefault: boolean;
        phone: string;
        address: string;
      }[]
    | undefined;
  addressId?: string | null;
}) => {
  const [address, setAddress] = useState("");
  const [state, setState] = useState("");
  const [selectedAddressId, setSelectedAddressId] = useState("");

  const { mutate: selectAddress, isPending: isSelecting } =
    useSelectedAddress();
  const { mutate: addAddress, isPending: isAdding } = useAddAddress();
  const { mutate: updateAddress, isPending: isUpdating } = useUpdateAddress();

  const { data: detailAddress, isPending: isPendingDetailAddress } =
    useGetAddress({ id: selectedAddressId });

  const isLoading = isSelecting || isAdding || isUpdating;

  const handleSubmit = (e: MouseEvent) => {
    e.preventDefault();
    selectAddress(
      { body: { addressId: address } },
      {
        onSuccess: () => onOpenChange(),
      }
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(e) => {
        onOpenChange();
        if (e) {
          if (addressId) {
            setAddress(addressId);
          }
        } else {
          setAddress("");
        }
      }}
    >
      <DialogContent showCloseButton={false} className="p-0 gap-0 lg:min-w-2xl">
        <DialogHeader className="border-b p-3 lg:p-5  gap-0">
          <div className="flex items-center justify-between capitalize">
            <DialogTitle>{state ?? "My"} Address</DialogTitle>
            {!state && (
              <Button
                onClick={() => setState("create")}
                className="w-auto text-xs rounded-full !px-4 bg-green-100 text-green-700 font-semibold hover:bg-green-200"
                size={"sm"}
                disabled={isLoading}
              >
                <PlusCircle className="size-3.5 stroke-[2.5]" />
                Add Address
              </Button>
            )}
          </div>
          <DialogDescription />
        </DialogHeader>
        {!state && (
          <div className="flex w-full flex-col gap-4 p-3 lg:p-5">
            {listAddresses?.length === 0 ? (
              <div className="flex flex-col gap-4">
                <div className="flex p-3 border border-red-500 rounded-md gap-3 items-center">
                  <div className="size-9 rounded-full border flex-none border-red-500 flex items-center justify-center">
                    <LocateOff className="text-red-500 size-5 flex-none " />
                  </div>
                  <div className="flex flex-col w-full">
                    <h5 className="font-semibold text-red-500 text-lg">
                      You don&apos;t have a shipping address yet!
                    </h5>
                    <p className="text-gray-700 text-sm">
                      Add your address now to ensure a smooth and timely
                      delivery.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3 max-h-[60vh] overflow-x-hidden overflow-y-auto">
                <RadioGroup
                  value={address}
                  onValueChange={setAddress}
                  className="flex flex-col gap-3"
                  disabled={isLoading}
                >
                  {listAddresses?.map((item) => (
                    <Label
                      key={item.id}
                      className="flex flex-col border rounded-md overflow-hidden gap-0"
                    >
                      <div className="flex items-center justify-between border-b py-2 px-3 gap-1 lg:gap-3 bg-green-50 w-full">
                        <div className="flex items-center gap-1 lg:gap-2 w-full">
                          <RadioGroupItem
                            value={item.id}
                            className="border-sci"
                            circleClassName="fill-sci text-sci"
                          />
                          <p className="font-semibold text-sm lg:text-base line-clamp-1">
                            {item.name}
                          </p>
                          |
                          <p className="text-xs whitespace-nowrap">
                            {item.phone}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {item.isDefault && (
                            <Badge className="rounded-full bg-sci">
                              Default
                            </Badge>
                          )}
                          <Button
                            variant={"link"}
                            size={"sm"}
                            className="p-0 size-8 lg:w-auto lg:px-3 lg:py-1.5"
                            onClick={() => {
                              setState("edit");
                              setSelectedAddressId(item.id);
                            }}
                            disabled={isLoading}
                          >
                            <Edit className="lg:hidden" />
                            <p className="hidden lg:flex">Change</p>
                          </Button>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5 lg:text-sm p-3 w-full text-xs">
                        <p className="text-gray-500">{item.detail}</p>
                        <p>{item.address}</p>
                      </div>
                    </Label>
                  ))}
                </RadioGroup>
              </div>
            )}
          </div>
        )}
        {(state === "create" ||
          (state === "edit" &&
            !!selectedAddressId &&
            !isPendingDetailAddress)) && (
          <FormSection
            state={state}
            selectedAddressId={selectedAddressId}
            addAddress={addAddress}
            updateAddress={updateAddress}
            detailAddress={detailAddress}
            setState={setState}
            setSelectedAddressId={setSelectedAddressId}
            isLoading={isLoading}
          />
        )}
        {state === "edit" && !!selectedAddressId && isPendingDetailAddress && (
          <div className="h-[50vh] flex-none flex flex-col gap-3 w-full items-center justify-center text-sm lg:text-base">
            <Loader className="animate-spin size-4 lg:size-6" />
            <p>Loading...</p>
          </div>
        )}
        {!state && (
          <DialogFooter className="px-3 lg:px-5 py-3 border-t">
            <Button
              variant={"outline"}
              disabled={isLoading}
              onClick={onOpenChange}
            >
              Cancel
            </Button>
            <Button variant={"sci"} disabled={isLoading} onClick={handleSubmit}>
              Confirm
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};
