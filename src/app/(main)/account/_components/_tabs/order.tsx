import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { parseAsString, useQueryState } from "nuqs";
import React, { useEffect, useMemo } from "react";
import { useGetOrders } from "../../_api";
import { UnpaidSVG } from "./_svg/unpaid";
import { ProcessedSVG } from "./_svg/processed";
import { ShippingSVG } from "./_svg/shipping";
import { CompletedSVG } from "./_svg/completed";
import { FailedSVG } from "./_svg/failed";
import { OrderList } from "./_section/order-list";
import { NoOrderYet } from "./_section/no-order-yet";

export const OrderTab = ({ tab }: { tab: string }) => {
  const [orderState, setOrderState] = useQueryState(
    "order",
    parseAsString.withDefault("unpaid")
  );

  const { data } = useGetOrders();

  const orderList = useMemo(() => data?.data, [data]);

  useEffect(() => {
    if (tab !== "order") {
      setOrderState("unpaid");
    }
  }, [tab]);
  return (
    <TabsContent
      value="order"
      className="bg-white p-5 flex flex-col text-sm gap-4"
    >
      <h4 className="font-bold text-lg">My Order</h4>
      <div className="flex flex-col gap-4">
        <Tabs
          value={orderState}
          onValueChange={setOrderState}
          className="gap-0 h-full"
        >
          {orderList && (
            <TabsList className="w-full bg-transparent h-auto gap-2 *:h-28 *:flex *:w-full *:flex-col *:items-center *:justify-center *:p-2 *:bg-green-50/50 *:rounded-md *:border-green-200 *:border *:gap-2 *:text-sm *:data-[state=active]:bg-green-50/50 *:data-[state=active]:shadow-none *:data-[state=active]:border-green-500">
              <TabsTrigger value="unpaid">
                <p>Unpaid</p>
                <UnpaidSVG />
                <p className="font-bold">
                  {(orderList.unpaid.length ?? 0).toLocaleString()}
                </p>
              </TabsTrigger>
              <TabsTrigger value="processed">
                <p>Proceseed</p>
                <ProcessedSVG />
                <p className="font-bold">
                  {(orderList.processed.length ?? 0).toLocaleString()}
                </p>
              </TabsTrigger>
              <TabsTrigger value="shipping">
                <p>Shipping</p>
                <ShippingSVG />
                <p className="font-bold">
                  {(orderList.shipping.length ?? 0).toLocaleString()}
                </p>
              </TabsTrigger>
              <TabsTrigger value="completed">
                <p>Completed</p>
                <CompletedSVG />
                <p className="font-bold">
                  {(orderList.completed.length ?? 0).toLocaleString()}
                </p>
              </TabsTrigger>
              <TabsTrigger value="failed">
                <p>Failed</p>
                <FailedSVG />
                <p className="font-bold">
                  {(orderList.failed.length ?? 0).toLocaleString()}
                </p>
              </TabsTrigger>
            </TabsList>
          )}
          <TabsContent
            value="unpaid"
            className="flex flex-col text-sm pt-5 gap-4"
          >
            {orderList &&
              orderList.unpaid.length > 0 &&
              orderList.unpaid.map((item) => (
                <OrderList order={item} key={item.id} state="unpaid" />
              ))}
            {orderList && orderList.unpaid.length < 1 && <NoOrderYet />}
          </TabsContent>
          <TabsContent
            value="processed"
            className="flex flex-col text-sm pt-5 gap-4"
          >
            {orderList &&
              orderList.processed.length > 0 &&
              orderList.processed.map((item) => (
                <OrderList order={item} key={item.id} state="processed" />
              ))}
            {orderList && orderList.processed.length < 1 && <NoOrderYet />}
          </TabsContent>
          <TabsContent
            value="shipping"
            className="flex flex-col text-sm pt-5 gap-4"
          >
            {orderList &&
              orderList.shipping.length > 0 &&
              orderList.shipping.map((item) => (
                <OrderList order={item} key={item.id} state="shipping" />
              ))}
            {orderList && orderList.shipping.length < 1 && <NoOrderYet />}
          </TabsContent>
          <TabsContent
            value="completed"
            className="flex flex-col text-sm pt-5 gap-4"
          >
            {orderList &&
              orderList.completed.length > 0 &&
              orderList.completed.map((item) => (
                <OrderList order={item} key={item.id} state="completed" />
              ))}
            {orderList && orderList.completed.length < 1 && <NoOrderYet />}
          </TabsContent>
          <TabsContent
            value="failed"
            className="flex flex-col text-sm pt-5 gap-4"
          >
            {orderList &&
              orderList.failed.length > 0 &&
              orderList.failed.map((item) => (
                <OrderList order={item} key={item.id} state="failed" />
              ))}
            {orderList && orderList.failed.length < 1 && <NoOrderYet />}
          </TabsContent>
        </Tabs>
      </div>
    </TabsContent>
  );
};
