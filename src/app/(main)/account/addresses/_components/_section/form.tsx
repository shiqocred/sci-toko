import { LabelInput } from "@/components/label-input";
import { cn } from "@/lib/utils";
import { MessageInputError } from "@/components/message-input-error";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { TooltipText } from "@/providers/tooltip-provider";
import { Button } from "@/components/ui/button";
import { Loader2, Send } from "lucide-react";
import { FormEvent, useState } from "react";
import { MapPicker } from "./map-picked";
import {
  AddAddressType,
  DetailAddressType,
  InputProps,
  UpdateAddressType,
} from "../client";
import { useRouter } from "next/navigation";

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

export const AddressForm = ({
  address,
  addressId,
  addAddress,
  updateAddress,
  isLoading,
  detailAddress,
}: {
  address: string;
  addressId: string;
  addAddress: AddAddressType;
  updateAddress: UpdateAddressType;
  isLoading: boolean;
  detailAddress: DetailAddressType;
}) => {
  const detailAddressFormatted = detailAddress?.data;
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [dialCode, setDialCode] = useState(
    detailAddressFormatted
      ? detailAddressFormatted.phoneNumber.split(" ")[0]
      : "+62"
  );
  const [input, setInput] = useState<InputProps>(
    detailAddressFormatted
      ? {
          name: detailAddressFormatted.name || "",
          phone: detailAddressFormatted.phoneNumber.split(" ")[1] || "",
          address: detailAddressFormatted.address || "",
          province: detailAddressFormatted.province || "",
          city: detailAddressFormatted.city || "",
          district: detailAddressFormatted.district || "",
          longitude: detailAddressFormatted.longitude || "",
          latitude: detailAddressFormatted.latitude || "",
          detail: detailAddressFormatted.detail || "",
          postal_code: detailAddressFormatted.postalCode || "",
          is_default: detailAddressFormatted.isDefault || false,
        }
      : { ...initialValue }
  );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const payload = {
      ...input,
      phone: `${dialCode} ${input.phone}`,
      is_default: input.is_default as boolean,
    };

    const onSuccess = () => {
      setInput(initialValue);
      router.push("/account/addresses");
    };

    const onError = (data: any) => {
      setErrors(data.response?.data?.errors || {});
    };

    if (address === "create") {
      addAddress({ body: payload }, { onSuccess, onError });
    } else if (address === "edit") {
      updateAddress(
        { body: payload, params: { id: addressId } },
        { onSuccess, onError }
      );
    }
  };
  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
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
            setInput((prev: any) => ({ ...prev, name: e.target.value }))
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
            setInput((prev: any) => ({ ...prev, phone: e.target.value }))
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
        className={cn("hidden", detailAddressFormatted?.isDefault && "flex")}
      >
        <Label
          className={cn(
            "flex items-center gap-3 w-fit",
            detailAddressFormatted?.isDefault && "cursor-not-allowed"
          )}
        >
          <Checkbox
            className="border-gray-500 disabled:opacity-100 disabled:pointer-events-auto disabled:cursor-not-allowed"
            checked={input.is_default}
            onCheckedChange={(e) =>
              setInput((prev: any) => ({ ...prev, is_default: e }))
            }
            disabled={detailAddressFormatted?.isDefault || isLoading}
          />
          <p className="text-sm font-medium">Set default address</p>
        </Label>
      </TooltipText>

      <Button
        type="submit"
        variant={"destructive"}
        disabled={
          isLoading ||
          !input.address ||
          !input.city ||
          !input.district ||
          !input.latitude ||
          !input.longitude ||
          !input.name ||
          !input.phone ||
          !input.province
        }
      >
        {isLoading ? <Loader2 className="animate-spin" /> : <Send />}
        {detailAddress ? "Update" : "Create"} Address
      </Button>
    </form>
  );
};
