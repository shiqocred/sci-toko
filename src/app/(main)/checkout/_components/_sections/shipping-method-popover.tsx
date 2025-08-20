// components/checkout/ShippingMethodPopover.tsx
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown } from "lucide-react";
import { cn, formatRupiah } from "@/lib/utils";
import { OngkirData } from "../types";

interface Props {
  ongkir: OngkirData;
  shipping: string;
  setShipping: (method: string) => void;
}

export function ShippingMethodPopover({
  ongkir,
  shipping,
  setShipping,
}: Props) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="justify-between min-h-9 h-auto text-start hover:bg-green-50"
        >
          {ongkir.express && shipping === "express" && (
            <ShippingDisplay courier={ongkir.express} name="Express" />
          )}
          {ongkir.regular && shipping === "regular" && (
            <ShippingDisplay courier={ongkir.regular} name="Regular" />
          )}
          {ongkir.economy && shipping === "economy" && (
            <ShippingDisplay courier={ongkir.economy} name="Economy" />
          )}
          <ChevronDown className="transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command>
          <CommandList>
            <CommandGroup>
              {ongkir.express && (
                <ShippingOption
                  selected={shipping === "express"}
                  onSelect={() => setShipping("express")}
                  courier={ongkir.express}
                  name="Express"
                />
              )}
              {ongkir.regular && (
                <ShippingOption
                  selected={shipping === "regular"}
                  onSelect={() => setShipping("regular")}
                  courier={ongkir.regular}
                  name="Regular"
                />
              )}
              {ongkir.economy && (
                <ShippingOption
                  selected={shipping === "economy"}
                  onSelect={() => setShipping("economy")}
                  courier={ongkir.economy}
                  name="Economy"
                />
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function ShippingDisplay({ courier, name }: { courier: any; name: string }) {
  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex flex-col gap-1">
        <p className="font-medium">{name}</p>
        <p className="text-xs text-gray-700 font-normal">
          Estimate {courier.duration}
        </p>
      </div>
      <p className="font-medium">{formatRupiah(courier.price)}</p>
    </div>
  );
}

function ShippingOption({
  selected,
  onSelect,
  courier,
  name,
}: {
  selected: boolean;
  onSelect: () => void;
  courier: any;
  name: string;
}) {
  return (
    <CommandItem
      onSelect={onSelect}
      className="min-h-9 h-auto data-[selected=true]:bg-green-50"
    >
      <div
        className={cn(
          "size-4 rounded border mr-1 flex-none flex items-center justify-center",
          selected ? "bg-primary border-primary" : "border-gray-500"
        )}
      >
        {selected && <Check className="size-3 text-white stroke-3" />}
      </div>
      <div className="flex flex-col flex-1 gap-1">
        <p className="font-medium">{name}</p>
        <p className="text-xs text-gray-700">Estimate {courier.duration}</p>
      </div>
      <p className="font-medium">{formatRupiah(courier.price)}</p>
    </CommandItem>
  );
}
