"use client";

import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  FileCheckIcon,
  FileText,
  MapPinned,
  PackageCheck,
  RefreshCcw,
  TagIcon,
  Truck,
  UserX2,
  X,
} from "lucide-react";
import Link from "next/link";
import React, { useMemo } from "react";
import { useGetOrder } from "../_api";
import { useParams } from "next/navigation";
import Image from "next/image";
import { cn, formatRupiah, sizesImage } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Separator } from "@/components/ui/separator";

const Client = () => {
  const { orderId } = useParams();

  const { data } = useGetOrder({ orderId: orderId as string });
  const history = useMemo(() => data?.data.history, [data]);
  const productsList = useMemo(() => data?.data.products, [data]);
  const orderData = useMemo(() => data?.data, [data]);
  return (
    <div className="bg-white p-5 flex flex-col text-sm gap-4">
      <div className="flex items-center w-full justify-between border-b border-gray-400 pb-4">
        <div className="flex items-center gap-3">
          <Button size={"icon"} variant={"ghost"} className="size-7" asChild>
            <Link href={"/account/orders"}>
              <ArrowLeft />
            </Link>
          </Button>
          <h4 className="font-bold text-base">Detail Order</h4>
        </div>
        <Badge
          className={cn(
            "capitalize px-3 py-1 text-black",
            orderData?.status === "waiting payment" && "bg-gray-200",
            orderData?.status === "processed" && "bg-blue-200",
            orderData?.status === "shipping" && "bg-yellow-200",
            orderData?.status === "delivered" && "bg-green-200",
            (orderData?.status === "expired" ||
              orderData?.status === "canceled") &&
              "bg-green-200"
          )}
        >
          {orderData?.status}
        </Badge>
      </div>
      <div className="flex flex-col gap-4 w-full text-sm">
        <div className="flex flex-col border rounded-md border-gray-300 overflow-hidden">
          <div className="p-3 w-full bg-green-50 flex items-center gap-2">
            <MapPinned className="size-4" />
            <h3 className="font-semibold">Delivery Address</h3>
          </div>
          <div className="p-3 border-t border-gray-300 flex flex-col gap-3">
            <div className="w-full flex gap-2 font-medium">
              <p>{orderData?.shipping_name}</p>
              <p>|</p>
              <p>{orderData?.shipping_phone}</p>
            </div>
            <p className="text-gray-600">
              {orderData?.shipping_address_note}, {orderData?.shipping_address}
            </p>
          </div>
        </div>
        <div className="flex flex-col border rounded-md border-gray-300 overflow-hidden">
          <div className="p-3 w-full bg-green-50 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Truck className="size-4" />
              <h3 className="font-semibold">Shipping Information</h3>
            </div>
            <div className="flex items-center gap-2">
              <p>{orderData?.shipping_courier_name}</p>
              <p>|</p>
              <p>{orderData?.shipping_waybill_id ?? "-"}</p>
            </div>
          </div>
          <div className="p-3 border-y border-gray-300 flex flex-col gap-3">
            {history ? (
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    "size-9 rounded-full flex items-center justify-center text-white flex-none",
                    (history.status === "CONFIRMED" ||
                      history.status === "ALLOCATED") &&
                      "!bg-blue-500",
                    history.status === "DELIVERED" && "!bg-green-500",
                    (history.status === "RETURNED" ||
                      history.status === "RETURN_IN_TRANSIT" ||
                      history.status === "ON_HOLD") &&
                      "!bg-orange-500",
                    (history.status === "COURIER_NOT_FOUND" ||
                      history.status === "DISPOSED" ||
                      history.status === "CANCELLED") &&
                      "!bg-red-500"
                  )}
                >
                  {(history.status === "CONFIRMED" ||
                    history.status === "ALLOCATED") && (
                    <FileCheckIcon size={14} />
                  )}
                  {(history.status === "PICKING_UP" ||
                    history.status === "DROPPING_OFF") && <Truck size={14} />}
                  {history.status === "PICKED" && <PackageCheck size={14} />}
                  {history.status === "COURIER_NOT_FOUND" && (
                    <UserX2 size={14} />
                  )}
                  {(history.status === "DISPOSED" ||
                    history.status === "CANCELLED") && <X size={14} />}
                  {(history.status === "RETURNED" ||
                    history.status === "RETURN_IN_TRANSIT") && (
                    <RefreshCcw size={14} />
                  )}
                  {history.status === "DELIVERED" && <Check size={14} />}
                  {history.status === "ON_HOLD" && <Clock size={14} />}
                </div>
                <div className="flex flex-col w-full gap-0.5">
                  <p className="font-medium">
                    Order is being prepared for shipment
                  </p>
                  {history.updatedAt && (
                    <p className="text-xs">
                      {format(new Date(history.updatedAt), "PP HH:mm", {
                        locale: id,
                      })}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="size-9 rounded-full flex items-center justify-center bg-green-100 flex-none">
                  <FileText className="size-4" />
                </div>
                <p className="font-medium">
                  Order is being prepared for shipment
                </p>
              </div>
            )}
          </div>
          <div className="px-3 py-2 min-h-10 flex items-center justify-between gap-3 text-xs">
            {orderData && (
              <p>
                Estimated delivery{" "}
                {orderData?.shipping_duration === "DAY"
                  ? format(new Date(orderData?.shipping_fastest), "PP", {
                      locale: id,
                    })
                  : format(new Date(orderData?.shipping_longest), "HH:mm", {
                      locale: id,
                    })}
              </p>
            )}
            {orderData?.history && (
              <Button
                className="ml-auto h-7 text-xs"
                size={"sm"}
                variant={"link"}
                asChild
              >
                <Link href={`/account/orders/${orderId}/track`}>
                  Track
                  <ArrowRight />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="font-semibold text-base">Products List</h3>
        {productsList &&
          productsList.map((product) => (
            <div
              key={product.id}
              className="flex bg-white rounded-md border border-gray-300 text-sm flex-col"
            >
              <div className="flex items-center gap-3 p-3">
                <div className="relative h-20 aspect-square border rounded">
                  <Image
                    fill
                    src={product.image ?? `/assets/images/logo-sci.png`}
                    alt="product"
                    sizes={sizesImage}
                    className="object-contain"
                  />
                </div>
                <div className="flex flex-col justify-between h-full w-full">
                  <p className="line-clamp-2 font-semibold">{product.name}</p>
                  {product.default_variant && (
                    <div className="items-center flex justify-between">
                      <p>
                        x
                        {parseFloat(
                          product.default_variant.quantity ?? "0"
                        ).toLocaleString()}
                      </p>
                      <p className="whitespace-nowrap flex-none text-end font-medium">
                        {formatRupiah(product.default_variant.price)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              {product.variant && (
                <div className="flex flex-col border-t divide-y border-gray-300">
                  {product.variant.map((variant) => (
                    <div
                      key={variant.id}
                      className="grid grid-cols-5 gap-3 p-3"
                    >
                      <div className="flex items-center gap-3 col-span-2">
                        <TagIcon className="size-3.5" />
                        <p className="font-semibold line-clamp-1">
                          {variant.name}
                        </p>
                      </div>
                      <p className="flex items-center col-span-1">
                        x{parseFloat(variant.quantity ?? "0").toLocaleString()}
                      </p>
                      <div className="whitespace-nowrap col-span-2 flex-none text-end font-medium">
                        {formatRupiah(variant.price)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
      </div>
      <div className="flex flex-col border rounded-md">
        <div className="flex flex-col gap-2 p-3">
          <div className="flex items-center justify-between">
            <p>Subtotal</p>
            <p>{formatRupiah(orderData?.product_price ?? 0)}</p>
          </div>
          <div className="flex items-center justify-between">
            <p>Shipping Cost</p>
            <p>{formatRupiah(orderData?.shipping_price ?? 0)}</p>
          </div>
        </div>
        <Separator />
        <div className="flex items-center p-3 justify-between font-semibold">
          <p>Total Price</p>
          <p>{formatRupiah(orderData?.total_price ?? 0)}</p>
        </div>
        <Separator />
        <div className="flex items-center p-3 justify-between">
          <p>Payment Method</p>
          <p>{orderData?.payment_formatted}</p>
        </div>
      </div>
    </div>
  );
};

export default Client;
