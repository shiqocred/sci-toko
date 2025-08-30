// app/checkout/Client.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  useAddVoucher,
  useCreateOrder,
  useGetAddresses,
  useGetCheckout,
  useGetOngkir,
  useRemoveVoucher,
} from "../_api";
import { Address } from "./types";
import { AddressSection } from "./_sections/address-section";
import { OrderListSection } from "./_sections/order-list-section";
import { ShippingMethodSection } from "./_sections/shipping-method-section";
import { OrderSummarySection } from "./_sections/order-summary-section";
import { CheckoutButton } from "./_sections/checkout-button";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  BadgePercent,
  Loader,
  Loader2,
  NotebookPen,
  X,
} from "lucide-react";
import Link from "next/link";
import { useConfirm } from "@/hooks/use-confirm";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { parseAsString, useQueryState } from "nuqs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { TooltipText } from "@/providers/tooltip-provider";

export default function Client() {
  const [shipping, setShipping] = useState("");
  const [available, setAvailable] = useState(false);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [voucher, setVoucher] = useState("");
  const router = useRouter();
  const [checkouted, setCheckouted] = useQueryState(
    "checkout",
    parseAsString.withDefault("")
  );

  const [OrderDialog, confirmOrder] = useConfirm(
    "Confirm Your Order",
    "Are you sure you want to proceed with this order? Please review your cart and shipping details",
    "destructive"
  );

  const { mutate: createOrder, isPending: isCreating } = useCreateOrder();
  const { mutate: addVoucher, isPending: isAdding } = useAddVoucher();
  const { mutate: removeVoucher, isPending: isRemoving } = useRemoveVoucher();

  const { data: addressesRes, isPending: isPendingAddresses } =
    useGetAddresses();
  const {
    data: checkoutRes,
    isPending: isPendingCheckout,
    isError,
    isSuccess,
    isRefetching,
  } = useGetCheckout();
  const {
    data: ongkir,
    isPending: isPendingOngkir,
    isRefetching: isRefetchingOngkir,
  } = useGetOngkir({ isSuccess, isPending: isPendingCheckout, isRefetching });

  const addresses = useMemo(
    () => addressesRes?.data as Address[],
    [addressesRes]
  );
  const checkout = useMemo(() => checkoutRes?.data, [checkoutRes]);

  // Hitung total harga
  const shippingPrice = useMemo(() => {
    if (!ongkir?.data || !shipping) return "0";
    const dataOngkir = ongkir.data;
    if (dataOngkir.economy?.id === shipping) return dataOngkir.economy.price;
    if (dataOngkir.regular?.id === shipping) return dataOngkir.regular.price;
    if (dataOngkir.express?.id === shipping) return dataOngkir.express.price;
    return "0";
  }, [ongkir, shipping]);

  const totalPrice = useMemo(() => {
    const shippingCost = checkout?.freeShipping ? 0 : parseFloat(shippingPrice);

    const total =
      (checkout?.price ?? 0) + shippingCost - (checkout?.total_discount || 0);

    return total < 0 ? 0 : total;
  }, [shippingPrice, checkout]);

  const isLoading = isPendingAddresses || isPendingCheckout || isPendingOngkir;

  const handleOrder = async () => {
    const ok = await confirmOrder();
    if (!ok) return;
    setCheckouted("proceed");
    createOrder(
      { body: { note: input, courierId: shipping } },
      { onSuccess: () => setCheckouted("order") }
    );
  };

  const handleAddVoucher = () => {
    addVoucher({ body: { voucher } }, { onSuccess: () => setVoucher("") });
  };
  const handleRemoveVoucher = () => {
    removeVoucher({});
  };

  useEffect(() => {
    if (
      isError &&
      checkouted !== "order" &&
      !isCreating &&
      !isPendingCheckout
    ) {
      toast.error("Select Product to checkout first");
      router.push("/cart");
    }
  }, [isError, isCreating, isPendingCheckout, checkouted]);

  useEffect(() => {
    if (checkouted === "order") {
      setAvailable(true);
      setTimeout(() => {
        setAvailable(false);
      }, 5000);
    }
  }, [checkouted]);

  return (
    <div className="bg-sky-50 h-full">
      <OrderDialog />
      <div className="max-w-[1240px] mx-auto w-full flex flex-col gap-4 md:gap-7 px-4 lg:px-8 py-10 md:py-14">
        <div className="flex items-center md:gap-2">
          <Button
            variant={"ghost"}
            size={"icon"}
            className="hover:bg-green-200"
          >
            <Link href={"/cart"}>
              <ArrowLeft className="size-5 stroke-2" />
            </Link>
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold">Checkout</h1>
        </div>

        {checkouted === "order" || checkouted === "proceed" ? (
          <div className="w-full h-[300px] flex items-center justify-center flex-col gap-2">
            <Loader className="size-6 animate-spin" />
            <p className="ml-2 animate-pulse">
              {checkouted === "order" ? "Redirect" : "Process"}ing...
            </p>
            {checkouted === "order" && (
              <Button
                className="mt-5"
                onClick={() => setCheckouted("")}
                disabled={available}
              >
                Back to checkout
              </Button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-5 gap-4 md:gap-6">
            <div className="md:col-span-3 flex flex-col gap-3 md:gap-4">
              <AddressSection
                addressId={checkout?.addressId}
                addresses={addresses}
                open={open}
                setOpen={setOpen}
                isLoading={isPendingAddresses}
              />
              <ShippingMethodSection
                ongkir={ongkir}
                shipping={shipping}
                checkout={checkout}
                setShipping={setShipping}
                isLoading={isPendingOngkir || isRefetchingOngkir}
                isPendingCheckout={isPendingCheckout}
              />
              <OrderListSection
                products={checkout?.products || []}
                totalItems={checkout?.total_item || 0}
                isLoading={isPendingCheckout}
              />
            </div>

            <div className="md:col-span-2 flex flex-col gap-3 md:gap-4">
              <div className="w-full rounded-lg shadow p-3 md:p-5 bg-white border flex flex-col gap-2 md:gap-3">
                <h3 className="font-semibold md:text-lg flex items-center gap-2">
                  <NotebookPen className="size-[18px] md:size-5" />
                  Note for seller
                </h3>
                <Textarea
                  className="border-gray-300 focus-visible:ring-0 focus-visible:border-gray-400 row-span-6 min-h-20 resize-none placeholder:text-xs md:placeholder:text-sm"
                  placeholder="Please leave a note..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
              </div>
              <div className="w-full rounded-lg shadow p-3 md:p-5 bg-white border flex flex-col gap-2 md:gap-3">
                <h3 className="font-semibold md:text-lg flex items-center gap-2">
                  <BadgePercent className="size-[18px] md:size-5" />
                  Voucher
                </h3>
                {checkout?.discount ? (
                  <div className="flex border rounded-md border-gray-300 items-center overflow-hidden">
                    <div className="w-5 h-full bg-red-400 flex-none" />
                    <div className="flex w-full flex-col gap-1 border-l-4 p-3 border-red-400 border-dashed text-sm">
                      <p className="font-medium">
                        Applied{" "}
                        <span className="font-semibold">
                          {checkout.discount.code}
                        </span>
                      </p>
                      <p className="text-xs">{checkout.discount.value}</p>
                    </div>
                    <TooltipText value="Remove Voucher">
                      <Button
                        size={"icon"}
                        variant={"ghost"}
                        className="mr-3"
                        onClick={handleRemoveVoucher}
                        disabled={isRemoving}
                      >
                        {isRemoving ? (
                          <Loader2 className="animate-spin" />
                        ) : (
                          <X />
                        )}
                      </Button>
                    </TooltipText>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Input
                      className="border-gray-300 focus-visible:ring-0 focus-visible:border-gray-400 shadow-none rounded-r-none border-r-0"
                      placeholder="Type voucher..."
                      value={voucher}
                      onChange={(e) => setVoucher(e.target.value)}
                    />
                    <Button
                      className="rounded-l-none"
                      variant={"sci"}
                      onClick={handleAddVoucher}
                      disabled={isAdding}
                    >
                      Apply{isAdding && "ing..."}
                    </Button>
                  </div>
                )}
              </div>

              <OrderSummarySection
                subtotal={checkout?.price || 0}
                checkout={checkout}
                shippingPrice={shippingPrice}
                totalPrice={totalPrice}
              />
              <CheckoutButton
                disabled={!shipping || !checkout?.addressId || isLoading}
                onClick={handleOrder}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
