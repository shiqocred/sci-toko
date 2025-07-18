"use client";

import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Send } from "lucide-react";
import React, { ChangeEvent, FormEvent } from "react";
import { cn } from "@/lib/utils";

type InputState = {
  ktp: File | null;
  kta: File | null;
  nik: string;
  no_kta: string;
  full_name: string;
};

type ErrorsState = {
  ktp: string;
  kta: string;
  nik: string;
  no_kta: string;
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
        <h1 className="text-3xl font-bold">Upgrade to Veterinarian</h1>
        <p className="text-[#707070] text-sm">
          Upgrade to Veterinarian to access exclusive promos. Make sure your
          personal information is correct.
        </p>
      </div>

      {/* KTP Upload */}
      <div className="w-full flex flex-col gap-1.5">
        <Label className="required">KTP File</Label>
        <FileUpload
          multiple={false}
          onChange={(file) =>
            setInput((prev) => ({ ...prev, ktp: file as File }))
          }
          isIdentityCard
        />
        {errors.ktp && (
          <p className="text-red-500 text-sm mt-1">{errors.ktp}</p>
        )}
      </div>

      {/* KTA Upload */}
      <div className="w-full flex flex-col gap-1.5">
        <Label className="required">KTA File</Label>
        <FileUpload
          multiple={false}
          onChange={(file) =>
            setInput((prev) => ({ ...prev, kta: file as File }))
          }
          isIdentityCard
        />
        {errors.kta && (
          <p className="text-red-500 text-sm mt-1">{errors.kta}</p>
        )}
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
        <Label htmlFor="nik" className="required">
          NIK
        </Label>
        <Input
          id="nik"
          name="nik"
          type="number"
          placeholder="Type your NIK Number"
          onChange={handleChange}
          value={input.nik}
          className={inputClass(!!errors.nik)}
          disabled={isUpgrading}
          required
        />
        {errors.nik && (
          <p className="text-red-500 text-sm mt-1">{errors.nik}</p>
        )}
      </div>

      {/* No KTA */}
      <div className="flex flex-col gap-1.5 w-full">
        <Label htmlFor="no_kta" className="required">
          KTA Number
        </Label>
        <Input
          id="no_kta"
          name="no_kta"
          type="number"
          placeholder="Type your KTA Number"
          onChange={handleChange}
          value={input.no_kta}
          className={inputClass(!!errors.no_kta)}
          disabled={isUpgrading}
          required
        />
        {errors.no_kta && (
          <p className="text-red-500 text-sm mt-1">{errors.no_kta}</p>
        )}
      </div>

      <Button
        type="submit"
        variant="destructive"
        className="border-gray-500 rounded-full w-full flex-auto"
        disabled={
          input.nik.length > 16 ||
          input.nik.length < 16 ||
          !input.ktp ||
          !input.kta ||
          !input.full_name ||
          !input.no_kta ||
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
