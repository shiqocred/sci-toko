import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import React, { ChangeEvent, useState } from "react";

interface ConfirmPasswordInputProps {
  input: {
    password: string;
    confirm_password: string;
  };
  disabled: boolean;
  handleChange: (e: ChangeEvent<HTMLInputElement>, isNumeric?: boolean) => void;
  errors: {
    confirm_password: string;
  };
}

export const ConfirmPasswordInput = ({
  input,
  handleChange,
  disabled,
  errors,
}: ConfirmPasswordInputProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const hasConfirm = !!input.confirm_password;
  const isMatch = input.password === input.confirm_password;

  const inputClass = cn(
    "bg-gray-100 border-gray-100 focus-visible:ring-0 focus-visible:border-gray-500",
    hasConfirm && !isMatch && "border-red-500 focus-visible:border-red-500",
    hasConfirm && isMatch && "focus-visible:border-green-500"
  );

  const showError = errors.confirm_password || (hasConfirm && !isMatch);

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <Label htmlFor="confirm_password" className="required">
        Confirm Password
      </Label>
      <div className="relative flex items-center">
        <Input
          id="confirm_password"
          className={inputClass}
          placeholder="Retype your password"
          type={isVisible ? "text" : "password"}
          onChange={handleChange}
          value={input.confirm_password}
          required
          disabled={disabled}
          autoComplete="off"
        />
        <Button
          type="button"
          className="absolute right-2 size-6 hover:bg-gray-200"
          size="icon"
          variant="ghost"
          onClick={() => setIsVisible((prev) => !prev)}
        >
          {isVisible ? <EyeOff /> : <Eye />}
        </Button>
      </div>
      {showError && (
        <p className="text-xs text-red-500">
          {errors.confirm_password ||
            "Password and Confirm Password do not match"}
        </p>
      )}
    </div>
  );
};
