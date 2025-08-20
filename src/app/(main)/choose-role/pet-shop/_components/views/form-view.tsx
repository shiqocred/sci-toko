import React, { ChangeEvent, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Loader2, Send } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface InputProps {
  personal_id_type: "NIK" | "NIB" | "NPWP";
  personal_id: string;
  full_name: string;
  personal_id_file: File | null;
  storefront_file: File | null;
}

interface ErrorProps {
  personal_id_type: string;
  personal_id: string;
  full_name: string;
}

interface FormViewProps {
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
  setInput: React.Dispatch<React.SetStateAction<InputProps>>;
  input: InputProps;
  errors: ErrorProps;
  isUpgrading: boolean;
}

export const FormView = ({
  handleSubmit,
  handleChange,
  setInput,
  input,
  errors,
  isUpgrading,
}: FormViewProps) => {
  const inputClass = (error: boolean) => {
    return cn(
      "bg-gray-100 border-gray-100 focus-visible:ring-0 focus-visible:border-gray-500",
      error && "border-red-500 focus-visible:border-red-500"
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md w-full p-5 bg-white rounded-2xl flex flex-col gap-4"
    >
      {/* Title Section */}
      <div className="text-center flex flex-col gap-1">
        <h1 className="text-3xl font-bold">Upgrade to Pet Shop</h1>
        <p className="text-sm text-[#707070]">
          Upgrade to Pet Shop to access exclusive promos. Make sure your
          personal information is correct.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Personal Id Type</Label>
        <Select
          value={input.personal_id_type}
          onValueChange={(e) =>
            setInput((prev) => ({
              ...prev,
              personal_id_type: e as "NIK" | "NIB" | "NPWP",
            }))
          }
        >
          <SelectTrigger className="w-full shadow-none border-gray-300 hover:border-gray-400 focus-visible:ring-0 data-[state=open]:border-gray-400">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="NIK">KTP</SelectItem>
              <SelectItem value="NIB">NIB</SelectItem>
              <SelectItem value="NPWP">NPWP</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1.5 w-full">
        <Label className="required">{input.personal_id_type} File</Label>
        <FileUpload
          multiple={false}
          isIdentityCard
          onChange={(file) =>
            setInput((prev) => ({ ...prev, personal_id_file: file as File }))
          }
        />
      </div>

      {/* Storefront Upload */}
      <div className="flex flex-col gap-1.5 w-full">
        <Label className="required">Photo of Your Pet Shop Building</Label>
        <FileUpload
          multiple={false}
          isIdentityCard
          onChange={(file) =>
            setInput((prev) => ({ ...prev, storefront_file: file as File }))
          }
        />
      </div>

      {/* Full Name Input */}
      <div className="flex flex-col gap-1.5 w-full">
        <Label htmlFor="full_name" className="required">
          Full Name
        </Label>
        <Input
          id="full_name"
          name="full_name"
          value={input.full_name}
          onChange={handleChange}
          placeholder="Type your full name"
          className={inputClass(!!errors.full_name)}
          disabled={isUpgrading}
          required
        />
        {errors.full_name && (
          <p className="text-xs text-red-500">{errors.full_name}</p>
        )}
      </div>

      {/* NIK Input */}
      <div className="flex flex-col gap-1.5 w-full">
        <Label htmlFor="personal_id" className="required">
          {input.personal_id_type}
        </Label>
        <Input
          id="personal_id"
          name="personal_id"
          type="number"
          value={input.personal_id}
          onChange={handleChange}
          placeholder={`Type your ${input.personal_id_type} number`}
          className={inputClass(!!errors.personal_id)}
          disabled={isUpgrading}
          required
        />
        {errors.personal_id && (
          <p className="text-xs text-red-500">{errors.personal_id}</p>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="destructive"
        className="rounded-full w-full flex items-center justify-center gap-2"
        disabled={
          !input.personal_id ||
          !input.personal_id_file ||
          !input.storefront_file ||
          !input.full_name ||
          isUpgrading
        }
      >
        {isUpgrading ? (
          <Loader2 className="animate-spin" />
        ) : (
          <Send size={16} />
        )}
        Submit{isUpgrading && "ing..."}
      </Button>
    </form>
  );
};
