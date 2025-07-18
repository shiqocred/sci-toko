"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Check, Eye, EyeOff, X } from "lucide-react";
import React, { ChangeEvent, useMemo, useState } from "react";

interface InputProps {
  password: string;
  confirm_password: string;
}

interface ValidationsProps {
  label: string;
  isValid: boolean;
}

interface PasswordInputProps {
  validations: ValidationsProps[];
  disabled: boolean;
  input: InputProps;
  allValid: boolean;
  isNewPassword?: boolean;
  handleChange: (e: ChangeEvent<HTMLInputElement>, isNumeric?: boolean) => void;
  errors: { password: string };
}

export const PasswordInput = ({
  validations,
  input,
  allValid,
  handleChange,
  disabled,
  isNewPassword = false,
  errors,
}: PasswordInputProps) => {
  const [isFocus, setIsFocus] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const validCount = useMemo(
    () => validations.filter((v) => v.isValid).length,
    [validations]
  );

  const progressPercentage = useMemo(
    () => (validCount / validations.length) * 100,
    [validCount, validations.length]
  );

  const strengthText = useMemo(() => {
    switch (validCount) {
      case 0:
        return "Very Weak";
      case 1:
        return "Weak";
      case 2:
        return "Medium";
      case 3:
        return "Strong";
      default:
        return "Very Strong";
    }
  }, [validCount]);

  const showValidation = isFocus || (input.password && !allValid);

  const inputClass = cn(
    "bg-gray-100 border-gray-100 focus-visible:ring-0 focus-visible:border-gray-500",
    input.password && allValid && isFocus && "focus-visible:border-green-500",
    ((input.password && !allValid) || errors.password) &&
      "border-red-500 focus-visible:border-red-500"
  );

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <Label htmlFor="password" className="required">
        {isNewPassword && "New "}Password
      </Label>
      <div className="flex flex-col w-full gap-3">
        <div className="relative flex items-center">
          <Input
            id="password"
            className={inputClass}
            placeholder="Type your password"
            type={isVisible ? "text" : "password"}
            onChange={handleChange}
            value={input.password}
            required
            onFocus={() => setIsFocus(true)}
            onBlur={() => setIsFocus(false)}
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
        {errors.password && (
          <p className="text-xs text-red-500">{errors.password}</p>
        )}
        {showValidation && (
          <ValidationView
            validations={validations}
            progressPercentage={progressPercentage}
            strengthText={strengthText}
            hasPassword={!!input.password}
            allValid={allValid}
          />
        )}
      </div>
    </div>
  );
};

interface ValidationViewProps {
  validations: ValidationsProps[];
  strengthText: string;
  progressPercentage: number;
  hasPassword: boolean;
  allValid: boolean;
}

const ValidationView = ({
  validations,
  strengthText,
  progressPercentage,
  hasPassword,
  allValid,
}: ValidationViewProps) => {
  return (
    <div
      className={cn(
        "w-full p-3 animate-in slide-in-from-top-2 duration-300 rounded-md border bg-gray-50 border-gray-200 space-y-2",
        hasPassword && allValid && "bg-green-50 border-green-200",
        hasPassword && !allValid && "bg-red-50 border-red-200"
      )}
    >
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <span className="text-xs font-medium">Password Strength:</span>
          <span className="text-xs font-medium">{strengthText}</span>
        </div>
        <Progress
          value={progressPercentage}
          className="h-1 transition-all duration-500"
        />
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium">Password Requirements:</p>
        <ul className="space-y-1">
          {validations.map(({ label, isValid }, i) => (
            <li
              key={`${label}-${i}`}
              className="flex items-center gap-2 text-xs"
            >
              {isValid ? (
                <Check className="size-3.5 text-green-500" />
              ) : (
                <X className="size-3.5 text-gray-400" />
              )}
              <span className={isValid ? "text-green-700" : "text-gray-600"}>
                {label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
