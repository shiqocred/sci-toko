"use client";

import React, { Dispatch, FormEvent, SetStateAction, useState } from "react";
import {
  AddAddressType,
  GetAddressType,
  UpdateAddressType,
} from "./dialog-select-address";
import { LabelInput } from "@/components/label-input";
import { cn } from "@/lib/utils";
import { MessageInputError } from "@/components/message-input-error";
import { MapPicker } from "@/app/(main)/account/addresses/_components/_section/map-picked";
import { TooltipText } from "@/providers/tooltip-provider";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Send } from "lucide-react";

export type InputProps = {
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
};

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

export const FormSection = ({
  state,
  selectedAddressId,
  addAddress,
  updateAddress,
  detailAddress,
  setState,
  setSelectedAddressId,
  isLoading,
}: {
  addAddress: AddAddressType;
  updateAddress: UpdateAddressType;
  detailAddress: GetAddressType;
  state: string;
  selectedAddressId: string;
  setState: Dispatch<SetStateAction<string>>;
  setSelectedAddressId: Dispatch<SetStateAction<string>>;
  isLoading: boolean;
}) => {
  const [dialCode, setDialCode] = useState(
    detailAddress ? detailAddress.data.phoneNumber.split(" ")[0] : "+62"
  );
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
  const [input, setInput] = useState<InputProps>(
    detailAddress
      ? {
          name: detailAddress.data.name ?? "",
          phone: detailAddress.data.phoneNumber.split(" ")[1],
          address: detailAddress.data.address ?? "",
          province: detailAddress.data.province ?? "",
          city: detailAddress.data.city ?? "",
          district: detailAddress.data.district ?? "",
          longitude: detailAddress.data.longitude ?? "",
          latitude: detailAddress.data.latitude ?? "",
          detail: detailAddress.data.detail ?? "",
          postal_code: detailAddress.data.postalCode ?? "",
          is_default: detailAddress.data.isDefault ?? false,
        }
      : initialValue
  );

  console.log("input bang", input, detailAddress?.data);

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

  return (
    <form onSubmit={handleCreate} className="flex w-full flex-col gap-4">
      <div className="flex flex-col relative overflow-x-hidden overflow-y-auto max-h-[60vh] gap-3 lg:gap-4 p-3 lg:p-5">
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
            label="Street, Building Name, Number, Sub-Village and Village"
            classLabel="required"
            placeholder="e.g. Jl. Merdeka, Merdeka Apartement, No. 5b"
            className={cn(
              "bg-gray-100 focus-visible:border-gray-500",
              errors?.address && "border-red-500 hover:border-red-500"
            )}
            value={input.address ?? ""}
            onChange={(e) =>
              setInput((prev: any) => ({ ...prev, address: e.target.value }))
            }
            disabled={isLoading}
          />
          <MessageInputError error={errors?.address} />
        </div>
        <div className="flex flex-col w-full gap-1.5">
          <LabelInput
            label="Additional details (e.g. Block, Unit, Landmark)"
            placeholder="e.g. Block Merdeka, Unit Melati, Depan Masjid Sulaiman"
            className={cn(
              "bg-gray-100 focus-visible:border-gray-500",
              errors?.detail && "border-red-500 hover:border-red-500"
            )}
            value={input.detail ?? ""}
            onChange={(e) =>
              setInput((prev: any) => ({ ...prev, detail: e.target.value }))
            }
            disabled={isLoading}
          />
          <MessageInputError error={errors?.detail} />
        </div>

        <TooltipText
          value="Unavailable to undefault address"
          className={cn("hidden", detailAddress?.data.isDefault && "flex")}
          side="right"
        >
          <Label
            className={cn(
              "flex items-center gap-3 w-fit",
              detailAddress?.data.isDefault && "cursor-not-allowed"
            )}
          >
            <Checkbox
              className="border-gray-500 disabled:opacity-100 disabled:pointer-events-auto disabled:cursor-not-allowed"
              checked={input.is_default}
              onCheckedChange={(e) =>
                setInput((prev) => ({ ...prev, is_default: e }))
              }
              disabled={detailAddress?.data.isDefault || isLoading}
            />
            <p className="text-sm font-medium">Set default address</p>
          </Label>
        </TooltipText>
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
        <Button disabled={isLoading} type="submit" variant={"destructive"}>
          <Send />
          {state === "create" ? "Create" : "Update"} Address
        </Button>
      </DialogFooter>
    </form>
  );
};
