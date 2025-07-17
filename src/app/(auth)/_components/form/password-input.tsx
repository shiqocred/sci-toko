import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Check, Eye, EyeOff, X } from "lucide-react";
import React, { ChangeEvent, useState } from "react";

export const PasswordInput = ({
  validations,
  input,
  allValid,
  handleChange,
  disabled,
  isNewPassword = false,
}: {
  validations: {
    label: string;
    isValid: boolean;
  }[];
  disabled: boolean;
  input: {
    password: string;
    confirm_password: string;
  };
  allValid: boolean;
  isNewPassword?: boolean;
  handleChange: (e: ChangeEvent<HTMLInputElement>, isNumeric?: boolean) => void;
}) => {
  const [isFocus, setIsFocus] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const validCount = validations.filter((v) => v.isValid).length;
  const progressPercentage = (validCount / validations.length) * 100;
  const getStrengthText = () => {
    if (validCount === 0) return "Very Weak";
    if (validCount === 1) return "Weak";
    if (validCount === 2) return "Medium";
    if (validCount === 3) return "Strong";
    return "Very Strong";
  };
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <Label htmlFor="password" className="required">
        {isNewPassword && "New "}Password
      </Label>
      <div className="flex flex-col w-full gap-3">
        <div className="relative flex items-center">
          <Input
            id="password"
            className={cn(
              "bg-gray-100 border-gray-100 focus-visible:ring-0 focus-visible:border-gray-500",
              input.password &&
                allValid &&
                isFocus &&
                "focus-visible:border-green-500",
              input.password &&
                !allValid &&
                "border-red-500 focus-visible:border-red-500"
            )}
            placeholder="Type your password"
            type={isVisible ? "text" : "password"}
            onChange={handleChange}
            value={input.password}
            required
            onFocus={() => setIsFocus(true)}
            onBlur={() => setIsFocus(false)}
            disabled={disabled}
          />
          <Button
            type="button"
            className="absolute right-2 size-6 hover:bg-gray-200"
            size={"icon"}
            variant={"ghost"}
            onClick={() => setIsVisible(!isVisible)}
          >
            {isVisible ? <EyeOff /> : <Eye />}
          </Button>
        </div>
        {(isFocus || (input.password && !allValid)) && (
          <div
            className={cn(
              "w-full p-3 animate-in slide-in-from-top-2 duration-300 rounded-md border bg-gray-50 border-gray-200 space-y-2",
              input.password && allValid && "bg-green-50 border-green-200",
              input.password && !allValid && "bg-red-50 border border-red-200"
            )}
          >
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium">Password Strength:</span>
                <span
                  className={`text-xs font-medium transition-colors duration-200`}
                >
                  {getStrengthText()}
                </span>
              </div>
              <Progress
                value={progressPercentage}
                className="h-1 transition-all duration-500"
              />
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium">Password Requirements:</p>
              <ul className="space-y-1">
                {validations.map((validation, index) => (
                  <li
                    key={`${validation.label}-${index}`}
                    className="flex items-center gap-2 text-xs"
                  >
                    {validation.isValid ? (
                      <Check className="size-3.5 text-green-500" />
                    ) : (
                      <X className="size-3.5 text-gray-400" />
                    )}
                    <span
                      className={
                        validation.isValid ? "text-green-700" : "text-gray-600"
                      }
                    >
                      {validation.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
