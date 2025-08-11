import { LabelInput } from "@/components/label-input";
import { cn } from "@/lib/utils";
import { MessageInputError } from "@/components/message-input-error";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { TooltipText } from "@/providers/tooltip-provider";
import { Button } from "@/components/ui/button";
import { Loader2, Send } from "lucide-react";
import { FormEvent } from "react";
import { MapPicker } from "./map-picked";

export const AddressForm = ({
  input,
  setInput,
  dialCode,
  setDialCode,
  errors,
  isLoading,
  handleSubmit,
  detailAddress,
}: {
  input: any;
  setInput: React.Dispatch<React.SetStateAction<any>>;
  dialCode: string;
  setDialCode: React.Dispatch<React.SetStateAction<string>>;
  errors: Record<string, string>;
  isLoading: boolean;
  handleSubmit: (e: FormEvent) => void;
  detailAddress: any;
}) => {
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
          label="Address Detail"
          classLabel="required"
          placeholder="Type address detail"
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
        className={cn("hidden", detailAddress?.isDefault && "flex")}
      >
        <Label
          className={cn(
            "flex items-center gap-3 w-fit",
            detailAddress?.isDefault && "cursor-not-allowed"
          )}
        >
          <Checkbox
            className="border-gray-500 disabled:opacity-100 disabled:pointer-events-auto disabled:cursor-not-allowed"
            checked={input.is_default}
            onCheckedChange={(e) =>
              setInput((prev: any) => ({ ...prev, is_default: e }))
            }
            disabled={detailAddress?.isDefault || isLoading}
          />
          <p className="text-sm font-medium">Set default address</p>
        </Label>
      </TooltipText>

      <Button type="submit" variant={"destructive"} disabled={isLoading}>
        {isLoading ? <Loader2 className="animate-spin" /> : <Send />}
        {detailAddress ? "Update" : "Create"} Address
      </Button>
    </form>
  );
};
