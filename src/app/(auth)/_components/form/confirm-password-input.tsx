import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import React, { ChangeEvent, useState } from "react";

export const ConfirmPasswordInput = ({
  input,
  handleChange,
  disabled,
}: {
  input: {
    password: string;
    confirm_password: string;
  };
  disabled: boolean;
  handleChange: (e: ChangeEvent<HTMLInputElement>, isNumeric?: boolean) => void;
}) => {
  const [isVisible, setIsVisible] = useState(false);
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <Label htmlFor="confirm_password" className="required">
        Confirm Password
      </Label>
      <div className="relative flex items-center">
        <Input
          id="confirm_password"
          className={cn(
            "bg-gray-100 border-gray-100 focus-visible:ring-0 focus-visible:border-gray-500",
            input.confirm_password &&
              input.password !== input.confirm_password &&
              "border-red-500 focus-visible:border-red-500",
            input.confirm_password &&
              input.password === input.confirm_password &&
              "focus-visible:border-green-500"
          )}
          placeholder="Retype your password"
          type={isVisible ? "text" : "password"}
          onChange={handleChange}
          value={input.confirm_password}
          required
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
    </div>
  );
};
