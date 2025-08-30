// components/checkout/ShippingMethodSection.tsx
import { Check, Loader, Truck } from "lucide-react";
import { ShippingMethodPopover } from "./shipping-method-popover";
import { NoCourierAvailable } from "./no-courier-available";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { CheckoutProps } from "../../_api";

interface Props {
  ongkir: any;
  shipping: string;
  setShipping: (s: string) => void;
  isLoading: boolean;
  isPendingCheckout: boolean;
  checkout?: CheckoutProps;
}

export function ShippingMethodSection({
  ongkir,
  shipping,
  setShipping,
  isLoading,
  checkout,
  isPendingCheckout,
}: Props) {
  const hasCourier =
    ongkir?.data?.express || ongkir?.data?.regular || ongkir?.data?.economy;

  useEffect(() => {
    if (ongkir?.data) {
      if (ongkir.data.express) setShipping(ongkir.data.express.id);
      else if (ongkir.data.regular) setShipping(ongkir.data.regular.id);
      else if (ongkir.data.economy) setShipping(ongkir.data.economy.id);
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
    <div className="w-full rounded-lg shadow p-3 md:p-5 bg-white border flex flex-col gap-3 md:gap-4">
      <h3 className="font-semibold md:text-lg flex items-center gap-2">
        <Truck className="size-[18px] md:size-5" />
        Shipping Method
      </h3>

      {renderContext()}

      <div
        className={cn(
          "border-gray-300 overflow-hidden shadow-none h-fit disabled:opacity-100 text-black rounded-md w-full flex items-center justify-center border text-center"
        )}
      >
        <div
          className={cn(
            "w-5 h-full flex-none",
            checkout?.freeShipping ? "bg-green-400" : "bg-gray-400"
          )}
        />
        <div
          className={cn(
            "flex w-full flex-col gap-1 border-l-4 p-3 border-dashed text-sm",
            checkout?.freeShipping ? "border-green-400" : "border-gray-400"
          )}
        >
          {isPendingCheckout ? (
            <div className="w-full animate-pulse">
              <p className="font-medium">
                Checking free shipping availability...
              </p>
            </div>
          ) : (
            <div className="w-full">
              {checkout?.freeShipping ? (
                <p className="font-medium">
                  Applied <span className="font-semibold">Free Shipping</span>
                </p>
              ) : (
                <p className="font-medium">Free Shipping Not Available</p>
              )}
            </div>
          )}
        </div>
        <div className="pr-3">
          {isPendingCheckout ? (
            <Loader className="animate-spin size-4" />
          ) : (
            <>{checkout?.freeShipping && <Check className="size-4" />}</>
          )}
        </div>
      </div>
    </div>
  );
}
