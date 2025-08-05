import { useAddAddress, useGetAddress } from "@/app/(main)/account/_api";
import { useUpdateAddress } from "@/app/(main)/account/_api/mutation/use-update-address";
import { MapPicker } from "@/app/(main)/account/_components/_tabs/address";
import { LabelInput } from "@/components/label-input";
import { MessageInputError } from "@/components/message-input-error";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { cn } from "@/lib/utils";
import { ArrowLeft, Loader, LocateOff, PlusCircle, Send } from "lucide-react";
import React, { FormEvent, MouseEvent, useEffect, useState } from "react";
import { useSelectedAddress } from "../../_api";

const initialValue = {
  address: "",
  district: "",
  city: "",
  province: "",
  latitude: "",
  longitude: "",
  postal_code: "",
  detail: "",
  name: "",
  phone: "",
  is_default: false,
};

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
  addressId: string | null;
}) => {
  const [address, setAddress] = useState("");
  const [state, setState] = useState("");
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [dialCode, setDialCode] = useState("+62");
  const [errors, setErrors] = useState({
    address: "",
    district: "",
    city: "",
    province: "",
    latitude: "",
    longitude: "",
    postal_code: "",
    detail: "",
    name: "",
    phone: "",
    is_default: "",
  });
  const [input, setInput] = useState<{
    address: string;
    district: string;
    city: string;
    province: string;
    latitude: string;
    longitude: string;
    postal_code: string;
    detail: string;
    name: string;
    phone: string;
    is_default: boolean | "indeterminate";
  }>(initialValue);

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

  const handleCreate = (e: FormEvent) => {
    e.preventDefault();
    if (state === "create") {
      addAddress(
        {
          body: {
            ...input,
            phone: `${dialCode} ${input.phone}`,
            is_default: input.is_default as boolean,
          },
        },
        {
          onSuccess: () => {
            setInput(initialValue);
            setState("");
          },
          onError: (data) => {
            setErrors((data.response?.data as any)?.errors);
          },
        }
      );
    } else if (state === "edit") {
      updateAddress(
        {
          body: {
            ...input,
            phone: `${dialCode} ${input.phone}`,
            is_default: input.is_default as boolean,
          },
          params: { id: selectedAddressId },
        },
        {
          onSuccess: () => {
            setInput(initialValue);
            setState("");
          },
          onError: (data) => {
            setErrors((data.response?.data as any)?.errors);
          },
        }
      );
    }
  };

  useEffect(() => {
    const detail = detailAddress?.data;
    if (detail) {
      const phone = detail?.phoneNumber.split(" ") ?? [];
      setInput({
        name: detail?.name ?? "",
        phone: phone[1],
        address: detail?.address ?? "",
        province: detail?.province ?? "",
        city: detail?.city ?? "",
        district: detail?.district ?? "",
        longitude: detail?.longitude ?? "",
        latitude: detail?.latitude ?? "",
        detail: detail?.detail ?? "",
        postal_code: detail?.postalCode ?? "",
        is_default: detail?.isDefault ?? false,
      });
      setDialCode(phone[0]);
    }
  }, [detailAddress]);

  useEffect(() => {
    if (open) {
      if (addressId) {
        setAddress(addressId);
      }
    } else {
      setAddress("");
    }
  }, [open]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="p-0 gap-0 min-w-2xl">
        <DialogHeader className="border-b p-5  gap-0">
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
          <div className="flex w-full flex-col gap-4 p-5">
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
                      <div className="flex items-center justify-between border-b py-2 px-3 bg-green-50 w-full">
                        <div className="flex items-center gap-2 w-full">
                          <RadioGroupItem
                            value={item.id}
                            className="border-sci"
                            circleClassName="fill-sci text-sci"
                          />
                          <p className="font-semibold text-base">{item.name}</p>
                          |<p className="text-xs">{item.phone}</p>
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
                            className=""
                            onClick={() => {
                              setState("edit");
                              setSelectedAddressId(item.id);
                            }}
                            disabled={isLoading}
                          >
                            Change
                          </Button>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5 text-sm p-3 w-full">
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
          <form onSubmit={handleCreate} className="flex w-full flex-col gap-4">
            <div className="flex flex-col relative overflow-x-hidden overflow-y-auto max-h-[60vh] gap-4 p-5">
              <div className="flex flex-col w-full gap-1.5">
                <LabelInput
                  label="Full Name"
                  classLabel="required"
                  placeholder="Type full name"
                  className={cn(
                    "bg-gray-100 focus-visible:border-gray-500",
                    errors?.name && "border-red-500 hover:border-red-500"
                  )}
                  value={input.name ?? ""}
                  onChange={(e) =>
                    setInput((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  disabled={isLoading}
                />
                <MessageInputError error={errors?.name} />
              </div>
              <div className="flex flex-col w-full gap-1.5">
                <LabelInput
                  label="Phone Number"
                  classLabel="required"
                  placeholder="Type phone number"
                  className={cn(
                    "bg-gray-100 focus-visible:border-gray-500",
                    errors?.phone && "border-red-500 hover:border-red-500"
                  )}
                  value={input.phone ?? ""}
                  onChange={(e) =>
                    setInput((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                  isPhone
                  dialCode={dialCode}
                  setDialCode={setDialCode}
                  disabled={isLoading}
                />
                <MessageInputError error={errors?.phone} />
              </div>

              <MapPicker input={input} setInput={setInput} errors={errors} />

              <div className="flex flex-col w-full gap-1.5">
                <LabelInput
                  label="Address Detail"
                  classLabel="required"
                  placeholder="Type address detail"
                  className={cn(
                    "bg-gray-100 focus-visible:border-gray-500",
                    errors?.detail && "border-red-500 hover:border-red-500"
                  )}
                  value={input.detail ?? ""}
                  onChange={(e) =>
                    setInput((prev) => ({
                      ...prev,
                      detail: e.target.value,
                    }))
                  }
                  disabled={isLoading}
                />
                <MessageInputError error={errors?.detail} />
              </div>

              <Label className="flex items-center gap-3">
                <Checkbox
                  className="border-gray-500"
                  checked={input.is_default}
                  onCheckedChange={(e) =>
                    setInput((prev) => ({ ...prev, is_default: e }))
                  }
                />
                <p className="text-sm font-medium">Set default address</p>
              </Label>
            </div>
            <DialogFooter className="px-5 py-3 border-t">
              <Button
                type="button"
                onClick={() => {
                  setSelectedAddressId("");
                  setState("");
                  setInput(initialValue);
                }}
                variant={"outline"}
                disabled={isLoading}
              >
                <ArrowLeft />
                Cancel
              </Button>
              <Button
                disabled={isLoading}
                type="submit"
                variant={"destructive"}
              >
                <Send />
                {state === "create" ? "Create" : "Update"} Address
              </Button>
            </DialogFooter>
          </form>
        )}
        {state === "edit" && !!selectedAddressId && isPendingDetailAddress && (
          <div className="h-[50vh] flex-none flex flex-col gap-3 w-full items-center justify-center">
            <Loader className="animate-spin size-6" />
            <p>Loading...</p>
          </div>
        )}
        {!state && (
          <DialogFooter className="px-5 py-3 border-t">
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
