// components/checkout/AddressSection.tsx
import { Button } from "@/components/ui/button";
import { Loader, MapPinned } from "lucide-react";
import { Address } from "../types";
import { DialogSelectAddress } from "../_dialogs";

interface Props {
  addressId: string | null;
  addresses: Address[] | undefined;
  open: boolean;
  setOpen: (open: boolean) => void;
  isLoading: boolean;
}

export function AddressSection({
  addressId,
  addresses,
  open,
  setOpen,
  isLoading,
}: Props) {
  const selected = addresses?.find((a) => a.id === addressId);

  return (
    <div className="w-full rounded-lg shadow p-5 bg-white border flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <MapPinned className="size-5" />
          Shipping Address
        </h3>
        <Button
          variant="outline"
          className="hover:bg-green-50"
          onClick={() => setOpen(true)}
        >
          Select
        </Button>
      </div>

      {isLoading ? (
        <div className="h-24 flex items-center justify-center flex-col gap-1">
          <Loader className="animate-spin size-5" />
          <p className="ml-1 text-sm">Loading...</p>
        </div>
      ) : (
        <div className="w-full">
          {selected && (
            <div className="flex flex-col border rounded-md overflow-hidden gap-0">
              <div className="flex items-center justify-between border-b py-2 px-3 bg-green-50">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{selected.name}</p>
                  <span>|</span>
                  <p className="text-xs">{selected.phone}</p>
                </div>
                {selected.isDefault && (
                  <span className="text-xs bg-sci px-2 py-0.5 rounded-full text-white">
                    Default
                  </span>
                )}
              </div>
              <div className="p-3 text-sm">
                <p className="text-gray-500">{selected.detail}</p>
                <p>{selected.address}</p>
              </div>
            </div>
          )}
        </div>
      )}
      <DialogSelectAddress
        open={open}
        onOpenChange={() => {
          if (open) {
            setOpen(false);
          }
        }}
        addressId={addressId}
        listAddresses={addresses}
      />
    </div>
  );
}
