"use client";

import React, { useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { parseAsString, useQueryState } from "nuqs";
import { Loader } from "lucide-react";

import { useGetOrders } from "../_api";
import { OrderList } from "./_section/order-list";
import { NoOrderYet } from "./_section/no-order-yet";

import { UnpaidSVG } from "./_svg/unpaid";
import { ProcessedSVG } from "./_svg/processed";
import { ShippingSVG } from "./_svg/shipping";
import { CompletedSVG } from "./_svg/completed";
import { FailedSVG } from "./_svg/failed";

const tabs = [
  { value: "unpaid", label: "Unpaid", Icon: UnpaidSVG },
  { value: "processed", label: "Processed", Icon: ProcessedSVG },
  { value: "shipping", label: "Shipping", Icon: ShippingSVG },
  { value: "completed", label: "Completed", Icon: CompletedSVG },
  { value: "failed", label: "Failed", Icon: FailedSVG },
];

const Client = () => {
  const [orderState, setOrderState] = useQueryState(
    "tab",
    parseAsString.withDefault("unpaid")
  );

  const { data, isPending } = useGetOrders();

  const orderList = useMemo(() => data?.data || {}, [data]) as any;

  return (
    <div className="bg-white p-3 md:p-4 lg:p-5 flex flex-col text-sm gap-3 md:gap-4">
      <h4 className="font-bold text-lg">My Order</h4>
      <Tabs
        value={orderState}
        onValueChange={setOrderState}
        className="gap-0 h-full w-full"
      >
        <TabsList className="w-full bg-transparent flex justify-start h-auto gap-3 md:gap-4 overflow-x-scroll scrollbar-hide *:h-28 *:flex *:w-auto *:md:w-full *:flex-col *:items-center *:justify-center *:p-2 *:bg-green-50/50 *:rounded-md *:border-green-200 *:border *:gap-2 *:data-[state=active]:bg-green-50/50 *:data-[state=active]:shadow-none *:data-[state=active]:border-green-500 *:aspect-square *:md:aspect-auto *:flex-none *:md:flex-auto *:text-xs *:md:text-sm">
          {tabs.map(({ value, label, Icon }) => (
            <TabsTrigger key={value} value={value}>
              <p>{label}</p>
              <Icon />
              <p className="font-bold">
                {(orderList[value]?.length ?? 0).toLocaleString()}
              </p>
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map(({ value }) => (
          <TabsContent
            key={value}
            value={value}
            className="flex text-sm pt-3 md:pt-4 lg:pt-5 w-full"
          >
            <OrderTabContent
              orders={orderList[value]}
              isLoading={isPending}
              state={value}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

const OrderTabContent = ({
  orders,
  isLoading,
  state,
}: {
  orders?: any[];
  isLoading: boolean;
  state: string;
}) => {
  if (isLoading) {
    return (
      <div className="h-52 flex flex-col items-center justify-center gap-2 w-full">
        <Loader className="animate-spin size-6" />
        <p className="ml-1 animate-pulse">Loading...</p>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return <NoOrderYet />;
  }

  return (
    <div className="w-full flex flex-col gap-2 md:gap-3 lg:gap-4">
      {orders.map((order) => (
        <OrderList key={order.id} order={order} state={state} />
      ))}
    </div>
  );
};

export default Client;
