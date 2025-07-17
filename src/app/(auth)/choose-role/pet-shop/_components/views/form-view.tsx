import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Send } from "lucide-react";
import React, { ChangeEvent, FormEvent } from "react";

export const FormView = ({
  handleSubmit,
  setInput,
  handleChange,
  input,
}: {
  handleSubmit: (e: FormEvent) => void;
  setInput: React.Dispatch<
    React.SetStateAction<{
      ktp: File | null;
      storefront: File | null;
      nik: string;
      full_name: string;
    }>
  >;
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
  input: {
    ktp: File | null;
    storefront: File | null;
    nik: string;
    full_name: string;
  };
}) => {
  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md w-full p-5 bg-white rounded-2xl flex flex-col gap-4"
    >
      <div className="flex flex-col gap-1 text-center">
        <h1 className="text-3xl font-bold">Upgrade to Pet Shop</h1>
        <p className="text-[#707070] text-sm">
          Upgrade to Pet Shop to access exclusive promos. Make sure your
          personal information is correct.
        </p>
      </div>
      <div className="w-full flex flex-col gap-1.5">
        <Label className="required">KTP File</Label>
        <FileUpload
          multiple={false}
          onChange={(e) =>
            setInput((prev: any) => ({ ...prev, ktp: e as File }))
          }
          isIdentityCard
        />
      </div>
      <div className="w-full flex flex-col gap-1.5">
        <Label className="required">Photo of Your Pet Shop Building</Label>
        <FileUpload
          multiple={false}
          onChange={(e) =>
            setInput((prev: any) => ({ ...prev, storefront: e as File }))
          }
          isIdentityCard
        />
      </div>
      <div className="flex flex-col gap-1.5 w-full">
        <Label htmlFor="full_name" className="required">
          Full Name
        </Label>
        <Input
          id="full_name"
          className="bg-gray-100 border-gray-100 focus-visible:ring-0 focus-visible:border-gray-500"
          placeholder="Type your Full Name"
          onChange={handleChange}
          value={input.full_name}
          required
          disabled={false}
        />
      </div>
      <div className="flex flex-col gap-1.5 w-full">
        <Label htmlFor="nik" className="required">
          NIK
        </Label>
        <Input
          id="nik"
          className="bg-gray-100 border-gray-100 focus-visible:ring-0 focus-visible:border-gray-500"
          placeholder="Type your NIK Number"
          type="number"
          onChange={handleChange}
          value={input.nik}
          required
          disabled={false}
        />
      </div>
      <Button
        type="submit"
        variant="destructive"
        className="border-gray-500 rounded-full w-full flex-auto"
      >
        <Send />
        Submit
      </Button>
    </form>
  );
};
