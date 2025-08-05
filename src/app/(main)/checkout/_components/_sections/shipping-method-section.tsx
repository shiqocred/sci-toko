// components/checkout/ShippingMethodSection.tsx
import { Loader, Truck } from "lucide-react";
import { ShippingMethodPopover } from "./shipping-method-popover";
import { NoCourierAvailable } from "./no-courier-available";
import { useEffect } from "react";

interface Props {
  ongkir: any;
  shipping: string;
  setShipping: (s: string) => void;
  isLoading: boolean;
}

export function ShippingMethodSection({
  ongkir,
  shipping,
  setShipping,
  isLoading,
}: Props) {
  const hasCourier =
    ongkir?.data?.express || ongkir?.data?.regular || ongkir?.data?.economy;

  useEffect(() => {
    if (ongkir?.data) {
      if (ongkir.data.express) setShipping("express");
      else if (ongkir.data.regular) setShipping("regular");
      else if (ongkir.data.economy) setShipping("economy");
      else setShipping("");
    }
  }, [ongkir]);

  const renderContext = () => {
    if (isLoading) {
      return (
        <div className="h-16 border rounded-md w-full px-3 py-2 flex items-center gap-4">
          <Loader className="size-5 animate-spin" />
          <p className="text-sm font-semibold">Loading available couriers...</p>
        </div>
      );
    }

    if (hasCourier) {
      return (
        <ShippingMethodPopover
          ongkir={ongkir.data}
          shipping={shipping}
          setShipping={setShipping}
        />
      );
    }

    return <NoCourierAvailable />;
  };

  return (
    <div className="w-full rounded-lg shadow p-5 bg-white border flex flex-col gap-4">
      <h3 className="font-semibold text-lg flex items-center gap-2">
        <Truck className="size-5" />
        Shipping Method
      </h3>

      {renderContext()}
    </div>
  );
}
