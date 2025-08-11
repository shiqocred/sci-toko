"use client";

import React, { FormEvent, useMemo, useState } from "react";
import { useUpdatePassword } from "../_api";
import { LabelInput } from "@/components/label-input";
import { cn } from "@/lib/utils";
import { MessageInputError } from "@/components/message-input-error";
import { ValidationView } from "./_section/validation-view";
import { Button } from "@/components/ui/button";

const Client = () => {
  const [isFocus, setIsFocus] = useState(false);
  const [inputPassword, setInputPassword] = useState({
    old_password: "",
    new_password: "",
    confirm_new_password: "",
  });

  const [errors, setErrors] = useState<{
    old_password: string;
    new_password: string;
    confirm_new_password: string;
  }>();

  const { mutate: updatePassword, isPending: isUpdatingPassword } =
    useUpdatePassword();

  const validations = [
    {
      label: "At least 8 characters",
      isValid: inputPassword.new_password.length >= 8,
    },
    {
      label: "At least 1 uppercase letter",
      isValid: /[A-Z]/.test(inputPassword.new_password),
    },
    {
      label: "At least 1 number",
      isValid: /\d/.test(inputPassword.new_password),
    },
    {
      label: "At least 1 symbol",
      isValid: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(
        inputPassword.new_password
      ),
    },
  ];

  const allValid = validations.every((v) => v.isValid);

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

  const showValidation = isFocus || (inputPassword.new_password && !allValid);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    updatePassword(
      { body: inputPassword },
      {
        onError: (data) => {
          setErrors((data.response?.data as any).errors);
        },
      }
    );
  };

  return (
    <div className="bg-white p-5">
      <form onSubmit={handleSubmit} className="flex flex-col text-sm gap-3">
        <div className="flex flex-col w-full gap-1.5">
          <LabelInput
            label="Old Password"
            placeholder="Type old password"
            isPassword
            className={cn(
              "bg-gray-100 focus-visible:border-gray-500",
              errors?.old_password && "border-red-500 hover:border-red-500"
            )}
            value={inputPassword.old_password}
            onChange={(e) =>
              setInputPassword((prev) => ({
                ...prev,
                old_password: e.target.value,
              }))
            }
            disabled={isUpdatingPassword}
          />
          <MessageInputError error={errors?.old_password} />
        </div>
        <div className="flex flex-col w-full gap-1.5">
          <LabelInput
            label="New Password"
            placeholder="Type new password"
            isPassword
            className={cn(
              "bg-gray-100 focus-visible:border-gray-500",
              errors?.new_password && "border-red-500 hover:border-red-500"
            )}
            value={inputPassword.new_password}
            onChange={(e) =>
              setInputPassword((prev) => ({
                ...prev,
                new_password: e.target.value,
              }))
            }
            onFocus={() => setIsFocus(true)}
            onBlur={() => setIsFocus(false)}
            disabled={isUpdatingPassword}
          />
          <MessageInputError error={errors?.new_password} />
          {showValidation && (
            <ValidationView
              validations={validations}
              progressPercentage={progressPercentage}
              strengthText={strengthText}
              hasPassword={!!inputPassword.new_password}
              allValid={allValid}
            />
          )}
        </div>
        <div className="flex flex-col w-full gap-1.5">
          <LabelInput
            label="Confirm New Password"
            placeholder="Retype new password"
            isPassword
            className={cn(
              "bg-gray-100 focus-visible:border-gray-500",
              errors?.confirm_new_password &&
                "border-red-500 hover:border-red-500"
            )}
            value={inputPassword.confirm_new_password}
            onChange={(e) =>
              setInputPassword((prev) => ({
                ...prev,
                confirm_new_password: e.target.value,
              }))
            }
            disabled={isUpdatingPassword}
          />
          <MessageInputError error={errors?.confirm_new_password} />
        </div>
        <Button
          type="submit"
          variant={"destructive"}
          className="mt-4"
          disabled={
            !inputPassword.old_password ||
            !inputPassword.new_password ||
            !inputPassword.confirm_new_password ||
            isUpdatingPassword
          }
        >
          Save New Password
        </Button>
      </form>
    </div>
  );
};

export default Client;
