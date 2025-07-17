import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { phoneNumberCode } from "@/lib/dial-phone";
import { cn } from "@/lib/utils";
import { Check, ChevronDown } from "lucide-react";
import React, { ChangeEvent, useEffect, useRef, useState } from "react";

export const PhoneNumberInput = ({
  input,
  handleChange,
  dialCode,
  setDialCode,
  disabled,
}: {
  input: {
    name: string;
    email: string;
    password: string;
    confirm_password: string;
    phone_number: string;
  };
  disabled: boolean;
  handleChange: (e: ChangeEvent<HTMLInputElement>, isNumeric?: boolean) => void;
  dialCode: string;
  setDialCode: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedRef = useRef<HTMLDivElement>(null);
  const commandListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Delay sedikit agar scroll terjadi setelah DOM render
      const timeout = setTimeout(() => {
        selectedRef.current?.scrollIntoView({
          block: "center",
          behavior: "auto",
        });
      }, 0);

      return () => clearTimeout(timeout);
    }
  }, [isOpen, dialCode]);
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <Label htmlFor="phone_number" className="required">
        Phone Number
      </Label>
      <div className="w-full relative flex items-center rounded-md overflow-hidden bg-red-200">
        <Input
          id="phone_number"
          className="bg-gray-100 border-gray-100 focus-visible:ring-0 focus-visible:border-gray-500 pl-20"
          placeholder="Type your phone number"
          type="number"
          onChange={(e) => handleChange(e, true)}
          value={input.phone_number}
          required
          disabled={disabled}
        />
        <div className="absolute left-2 flex items-center justify-center w-16">
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                className=" h-auto w-fit !px-1 !py-0.5 rounded-full gap-1 text-xs shadow-none bg-white text-black hover:bg-gray-200"
              >
                {dialCode}
                <ChevronDown />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0">
              <Command>
                <CommandInput
                  placeholder="Search dial phone..."
                  onValueChange={() => {
                    if (commandListRef.current) {
                      commandListRef.current.scrollTo({
                        top: 0,
                        behavior: "auto",
                      });
                    }
                  }}
                />
                <CommandList className="p-0" ref={commandListRef}>
                  <CommandEmpty>No results found.</CommandEmpty>
                  <CommandGroup className="p-0 px-1">
                    {phoneNumberCode.map((item) => (
                      <CommandItem
                        key={item.code}
                        className="flex items-center gap-4"
                        ref={item.dial_code === dialCode ? selectedRef : null}
                        onSelect={() => {
                          setDialCode(item.dial_code);
                          setIsOpen(false);
                        }}
                      >
                        <p className=" w-12">{item.dial_code}</p>
                        <div className="flex items-center gap-4 justify-between w-full">
                          <div className="flex items-center gap-2 w-full">
                            <p>{item.emoji}</p>
                            <p>{item.name}</p>
                          </div>
                          <Check
                            className={cn(
                              "size-4",
                              item.dial_code === dialCode ? "flex" : "hidden"
                            )}
                          />
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
};
