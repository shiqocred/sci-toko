import React, { ChangeEvent, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Loader2, Send } from "lucide-react";

interface InputProps {
  ktp: File | null;
  storefront: File | null;
  nik: string;
  full_name: string;
}

interface ErrorProps {
  ktp?: string;
  storefront?: string;
  nik?: string;
  full_name?: string;
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

      {/* KTP Upload */}
      <div className="flex flex-col gap-1.5 w-full">
        <Label className="required">KTP File</Label>
        <FileUpload
          multiple={false}
          isIdentityCard
          onChange={(file) =>
            setInput((prev) => ({ ...prev, ktp: file as File }))
          }
        />
        {errors.ktp && <p className="text-xs text-red-500">{errors.ktp}</p>}
      </div>

      {/* Storefront Upload */}
      <div className="flex flex-col gap-1.5 w-full">
        <Label className="required">Photo of Your Pet Shop Building</Label>
        <FileUpload
          multiple={false}
          isIdentityCard
          onChange={(file) =>
            setInput((prev) => ({ ...prev, storefront: file as File }))
          }
        />
        {errors.storefront && (
          <p className="text-xs text-red-500">{errors.storefront}</p>
        )}
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
        <Label htmlFor="nik" className="required">
          NIK
        </Label>
        <Input
          id="nik"
          name="nik"
          type="number"
          value={input.nik}
          onChange={handleChange}
          placeholder="Type your NIK Number"
          className={inputClass(!!errors.nik)}
          disabled={isUpgrading}
          required
        />
        {errors.nik && <p className="text-xs text-red-500">{errors.nik}</p>}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="destructive"
        className="rounded-full w-full flex items-center justify-center gap-2"
        disabled={
          input.nik.length > 16 ||
          input.nik.length < 16 ||
          !input.ktp ||
          !input.storefront ||
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
