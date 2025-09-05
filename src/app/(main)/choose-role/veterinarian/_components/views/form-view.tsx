"use client";

import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Send } from "lucide-react";
import React, { ChangeEvent, FormEvent } from "react";
import { cn } from "@/lib/utils";

type InputState = {
  personal_id: string;
  veterinarian_id: string;
  full_name: string;
  personal_id_file: File | null;
  veterinarian_id_file: File | null;
};

type ErrorsState = {
  personal_id: string;
  veterinarian_id: string;
  full_name: string;
};

interface FormViewProps {
  handleSubmit: (e: FormEvent) => void;
  setInput: React.Dispatch<React.SetStateAction<InputState>>;
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
  input: InputState;
  errors: ErrorsState;
  isUpgrading: boolean;
}

export const FormView = ({
  handleSubmit,
  setInput,
  handleChange,
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
      <div className="flex flex-col gap-1 text-center">
        <h1 className="text-3xl font-bold">Upgrade to Vet Clinic</h1>
        <p className="text-[#707070] text-sm">
          Upgrade to Vet Clinic to access exclusive promos. Make sure your
          personal information is correct.
        </p>
      </div>

      <div className="w-full flex flex-col gap-1.5">
        <Label className="required">KTP File</Label>
        <FileUpload
          multiple={false}
          onChange={(file) =>
            setInput((prev) => ({ ...prev, personal_id_file: file as File }))
          }
          isIdentityCard
        />
      </div>

      {/* KTA Upload */}
      <div className="w-full flex flex-col gap-1.5">
        <Label className="required">KTA File</Label>
        <FileUpload
          multiple={false}
          onChange={(file) =>
            setInput((prev) => ({
              ...prev,
              veterinarian_id_file: file as File,
            }))
          }
          isIdentityCard
        />
      </div>

      {/* Full Name */}
      <div className="flex flex-col gap-1.5 w-full">
        <Label htmlFor="full_name" className="required">
          Full Name
        </Label>
        <Input
          id="full_name"
          name="full_name"
          placeholder="Type your Full Name"
          onChange={handleChange}
          value={input.full_name}
          className={inputClass(!!errors.full_name)}
          disabled={isUpgrading}
          required
        />
        {errors.full_name && (
          <p className="text-red-500 text-sm mt-1">{errors.full_name}</p>
        )}
      </div>

      {/* NIK */}
      <div className="flex flex-col gap-1.5 w-full">
        <Label htmlFor="personal_id" className="required">
          NIK
        </Label>
        <Input
          id="personal_id"
          name="personal_id"
          type="number"
          placeholder="Type your NIK Number"
          onChange={handleChange}
          value={input.personal_id}
          className={inputClass(!!errors.personal_id)}
          disabled={isUpgrading}
          required
        />
        {errors.personal_id && (
          <p className="text-red-500 text-sm mt-1">{errors.personal_id}</p>
        )}
      </div>

      {/* No KTA */}
      <div className="flex flex-col gap-1.5 w-full">
        <Label htmlFor="veterinarian_id" className="required">
          KTA Number
        </Label>
        <Input
          id="veterinarian_id"
          name="veterinarian_id"
          type="number"
          placeholder="Type your KTA Number"
          onChange={handleChange}
          value={input.veterinarian_id}
          className={inputClass(!!errors.veterinarian_id)}
          disabled={isUpgrading}
          required
        />
        {errors.veterinarian_id && (
          <p className="text-red-500 text-sm mt-1">{errors.veterinarian_id}</p>
        )}
      </div>

      <Button
        type="submit"
        variant="destructive"
        className="border-gray-500 rounded-full w-full flex-auto"
        disabled={
          !input.personal_id ||
          !input.personal_id_file ||
          !input.veterinarian_id ||
          !input.full_name ||
          !input.veterinarian_id_file ||
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
