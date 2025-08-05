// app/checkout/Client.tsx
"use client";

import { useMemo, useState } from "react";
import { useGetAddresses, useGetCheckout, useGetOngkir } from "../_api";
import { Address, CheckoutData } from "./types";
import { AddressSection } from "./_sections/address-section";
import { OrderListSection } from "./_sections/order-list-section";
import { ShippingMethodSection } from "./_sections/shipping-method-section";
import { OrderSummarySection } from "./_sections/order-summary-section";
import { CheckoutButton } from "./_sections/checkout-button";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function Client() {
  const [shipping, setShipping] = useState("");
  const [open, setOpen] = useState(false);

  const { data: addressesRes, isPending: isPendingAddresses } =
    useGetAddresses();
  const { data: checkoutRes, isPending: isPendingCheckout } = useGetCheckout();
  const {
    data: ongkir,
    isPending: isPendingOngkir,
    isRefetching: isRefetchingOngkir,
  } = useGetOngkir();

  const addresses = useMemo(
    () => addressesRes?.data as Address[],
    [addressesRes]
  );
  const checkout = useMemo(
    () => checkoutRes?.data as CheckoutData,
    [checkoutRes]
  );

  // Hitung total harga
  const shippingPrice = useMemo(() => {
    if (!ongkir?.data || !shipping) return "0";
    return (
      ongkir.data[shipping as "express" | "regular" | "economy"]?.price || "0"
    );
  }, [ongkir, shipping]);

  const totalPrice = useMemo(() => {
    return parseFloat(shippingPrice) + (checkout?.price ?? 0);
  }, [shippingPrice, checkout?.price]);

  const isLoading = isPendingAddresses || isPendingCheckout || isPendingOngkir;

  return (
    <div className="bg-sky-50 h-full">
      <div className="max-w-[1240px] mx-auto w-full flex flex-col gap-7 px-4 lg:px-8 py-14">
        <div className="flex items-center gap-2">
          <Button
            variant={"ghost"}
            size={"icon"}
            className="hover:bg-green-200"
          >
            <Link href={"/cart"}>
              <ArrowLeft className="size-5 stroke-2" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Checkout</h1>
        </div>

        <div className="grid grid-cols-5 gap-6">
          <div className="col-span-3 flex flex-col gap-4">
            <AddressSection
              addressId={checkout?.addressId}
              addresses={addresses}
              open={open}
              setOpen={setOpen}
              isLoading={isPendingAddresses}
            />
            <OrderListSection
              products={checkout?.products || []}
              totalItems={checkout?.total_item || 0}
            />
          </div>

          <div className="col-span-2 flex flex-col gap-4">
            <ShippingMethodSection
              ongkir={ongkir}
              shipping={shipping}
              setShipping={setShipping}
              isLoading={isPendingOngkir || isRefetchingOngkir}
            />
            <OrderSummarySection
              subtotal={checkout?.price || 0}
              shippingPrice={shippingPrice}
              totalPrice={totalPrice}
            />
            <CheckoutButton
              disabled={!shipping || !checkout?.addressId || isLoading}
              onClick={() => console.log("Checkout!")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
