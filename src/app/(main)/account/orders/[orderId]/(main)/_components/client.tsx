"use client";

import React, { useMemo } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { id } from "date-fns/locale";

import { HistoryStatus, ProductOutput, useGetOrder } from "../_api";
import { cn, formatRupiah, sizesImage } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  FileCheckIcon,
  FileText,
  Loader,
  MapPinned,
  PackageCheck,
  RefreshCcw,
  TagIcon,
  Truck,
  UserX2,
  X,
} from "lucide-react";

/** Badge color mapping for order status */
const statusBadgeMap: Record<string, string> = {
  "waiting payment": "bg-gray-200 text-black",
  processed: "bg-blue-200 text-black",
  shipping: "bg-yellow-200 text-black",
  delivered: "bg-green-200 text-black",
  expired: "bg-green-200 text-black",
  canceled: "bg-green-200 text-black",
};

/** Icon and color mapping for history status */
const historyStatusConfig: Record<
  HistoryStatus,
  { icon: React.FC<any>; color: string }
> = {
  CONFIRMED: { icon: FileCheckIcon, color: "bg-blue-500 text-white" },
  SCHEDULED: { icon: FileCheckIcon, color: "bg-blue-500 text-white" },
  ALLOCATED: { icon: FileCheckIcon, color: "bg-blue-500 text-white" },
  PICKING_UP: { icon: Truck, color: "bg-gray-700 text-white" },
  PICKED: { icon: PackageCheck, color: "bg-gray-700 text-white" },
  CANCELLED: { icon: X, color: "bg-red-500 text-white" },
  ON_HOLD: { icon: Clock, color: "bg-orange-500 text-white" },
  DROPPING_OFF: { icon: Truck, color: "bg-gray-700 text-white" },
  RETURN_IN_TRANSIT: { icon: RefreshCcw, color: "bg-orange-500 text-white" },
  RETURNED: { icon: RefreshCcw, color: "bg-orange-500 text-white" },
  REJECTED: { icon: X, color: "bg-red-500 text-white" },
  DISPOSED: { icon: X, color: "bg-red-500 text-white" },
  COURIER_NOT_FOUND: { icon: UserX2, color: "bg-red-500 text-white" },
  DELIVERED: { icon: Check, color: "bg-green-500 text-white" },
  PENDING: { icon: FileText, color: "bg-green-100 text-gray-700" },
};

/** Loader component */
const Loading = () => (
  <div className="h-52 flex flex-col items-center justify-center gap-2 w-full bg-white">
    <Loader className="animate-spin size-6" />
    <p className="ml-1 animate-pulse">Loading...</p>
  </div>
);

/** Badge component for order status */
const OrderStatusBadge = ({ status }: { status?: string }) => {
  const className = status
    ? (statusBadgeMap[status.toLowerCase()] ?? "bg-gray-200")
    : "bg-gray-200";
  return (
    <Badge className={`capitalize px-3 py-1 ${className}`}>
      {status ?? "-"}
    </Badge>
  );
};

/** History icon + color display */
const HistoryStatusIcon = ({ status }: { status: HistoryStatus }) => {
  const config = historyStatusConfig[status] || {
    icon: FileText,
    color: "bg-green-100 text-gray-700",
  };
  const IconComponent = config.icon;
  return (
    <div
      className={`size-9 rounded-full flex items-center justify-center ${config.color} flex-none`}
    >
      <IconComponent size={14} />
    </div>
  );
};

/** Delivery address card */
const DeliveryAddress = ({
  name,
  phone,
  addressNote,
  address,
}: {
  name?: string;
  phone?: string;
  addressNote?: string;
  address?: string;
}) => (
  <div className="flex flex-col border rounded-md border-gray-300 overflow-hidden">
    <div className="p-3 w-full bg-green-50 flex items-center gap-2">
      <MapPinned className="size-4" />
      <h3 className="font-semibold">Delivery Address</h3>
    </div>
    <div className="p-3 border-t border-gray-300 flex flex-col gap-3">
      <div className="w-full flex gap-2 font-medium">
        <p>{name}</p>
        <p>|</p>
        <p>{phone}</p>
      </div>
      <p className="text-gray-600">
        {addressNote}, {address}
      </p>
    </div>
  </div>
);

/** Shipping information card */
const ShippingInfo = ({
  courierName,
  waybillId,
  history,
}: {
  courierName?: string;
  waybillId?: string | null;
  history?: any;
}) => (
  <div className="flex flex-col border rounded-md border-gray-300 overflow-hidden">
    <div className="p-3 w-full bg-green-50 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <Truck className="size-4" />
        <h3 className="font-semibold">Shipping Information</h3>
      </div>
      <div className="flex items-center gap-2">
        <p>{courierName}</p>
        <p>|</p>
        <p>{waybillId ?? "-"}</p>
      </div>
    </div>
    <div className="p-3 border-y border-gray-300 flex flex-col gap-3">
      {history ? (
        <div className="flex items-center gap-4">
          <HistoryStatusIcon status={history.status} />
          <div className="flex flex-col w-full gap-0.5">
            <p className="font-medium">
              {/* You might want to make this dynamic based on status */}
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
          <p className="font-medium">Order is being prepared for shipment</p>
        </div>
      )}
    </div>
    <div className="px-3 py-2 min-h-10 flex items-center justify-between gap-3 text-xs">
      {courierName && (
        <p>
          Estimated delivery {/* Simplify the date display */}
          {history?.shipping_duration === "DAY"
            ? format(new Date(history?.shipping_fastest ?? Date.now()), "PP", {
                locale: id,
              })
            : format(
                new Date(history?.shipping_longest ?? Date.now()),
                "HH:mm",
                { locale: id }
              )}
        </p>
      )}
      {history && (
        <Button
          size="sm"
          variant="link"
          asChild
          className="ml-auto h-7 text-xs"
        >
          <Link href={`/account/orders/${history.orderId}/track`}>
            Track <ArrowRight />
          </Link>
        </Button>
      )}
    </div>
  </div>
);

/** Products list item */
const ProductItem = ({ product }: { product: ProductOutput }) => (
  <div
    key={product.id}
    className="flex bg-white rounded-md border border-gray-300 text-sm flex-col"
  >
    <div className="flex items-center gap-3 p-3">
      <div className="relative h-20 aspect-square border rounded">
        <Image
          fill
          src={product.image ?? `/assets/images/logo-sci.png`}
          alt={product.name ?? ""}
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
              {formatRupiah(product.default_variant.price ?? 0)}
            </p>
          </div>
        )}
      </div>
    </div>
    {product.variant && (
      <div className="flex flex-col border-t divide-y border-gray-300">
        {product.variant.map((variant) => (
          <div key={variant.id} className="grid grid-cols-5 gap-3 p-3">
            <div className="flex items-center gap-3 col-span-2">
              <TagIcon className="size-3.5" />
              <p className="font-semibold line-clamp-1">{variant.name}</p>
            </div>
            <p className="flex items-center col-span-1">
              x{parseFloat(variant.quantity ?? "0").toLocaleString()}
            </p>
            <div className="whitespace-nowrap col-span-2 flex-none text-end font-medium">
              {formatRupiah(variant.price ?? 0)}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

/** Price summary card */
const PriceSummary = ({
  productPrice,
  shippingPrice,
  totalPrice,
  paymentMethod,
}: {
  productPrice?: string;
  shippingPrice?: string;
  totalPrice?: string;
  paymentMethod?: string;
}) => (
  <div className="flex flex-col border rounded-md">
    <div className="flex flex-col gap-2 p-3">
      <div className="flex items-center justify-between">
        <p>Subtotal</p>
        <p>{formatRupiah(productPrice ?? 0)}</p>
      </div>
      <div className="flex items-center justify-between">
        <p>Shipping Cost</p>
        <p>{formatRupiah(shippingPrice ?? 0)}</p>
      </div>
    </div>
    <Separator />
    <div className="flex items-center p-3 justify-between font-semibold">
      <p>Total Price</p>
      <p>{formatRupiah(totalPrice ?? 0)}</p>
    </div>
    <Separator />
    <div className="flex items-center p-3 justify-between">
      <p>Payment Method</p>
      <p>{paymentMethod ?? "-"}</p>
    </div>
  </div>
);

const Client = () => {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");
  const { orderId } = useParams();
  const { data, isPending } = useGetOrder({ orderId: orderId as string });

  const orderData = data?.data;
  const history = useMemo(() => orderData?.history, [orderData]);
  const productsList = useMemo(() => orderData?.products, [orderData]);

  return (
    <div className="bg-white p-5 flex flex-col text-sm gap-4">
      <header className="flex items-center w-full justify-between border-b border-gray-400 pb-4">
        <div className="flex items-center gap-3">
          <Button size="icon" variant="ghost" className="size-7" asChild>
            <Link href={`/account/orders${tab ? `?tab=${tab}` : ""}`}>
              <ArrowLeft />
            </Link>
          </Button>
          <h4 className="font-bold text-base">Detail Order</h4>
        </div>
        {!isPending && <OrderStatusBadge status={orderData?.status} />}
      </header>

      {isPending ? (
        <Loading />
      ) : (
        <div className="flex flex-col gap-4">
          <section className="flex flex-col gap-4 w-full text-sm">
            <DeliveryAddress
              name={orderData?.shipping_name}
              phone={orderData?.shipping_phone}
              addressNote={orderData?.shipping_address_note}
              address={orderData?.shipping_address}
            />

            <ShippingInfo
              courierName={orderData?.shipping_courier_name}
              waybillId={orderData?.shipping_waybill_id}
              history={history}
            />
          </section>

          <section className="flex flex-col gap-2">
            <h3 className="font-semibold text-base">Products List</h3>
            {productsList?.map((product) => (
              <ProductItem key={product.id} product={product} />
            ))}
          </section>

          <PriceSummary
            productPrice={orderData?.product_price}
            shippingPrice={orderData?.shipping_price}
            totalPrice={orderData?.total_price}
            paymentMethod={orderData?.payment_formatted}
          />
        </div>
      )}
    </div>
  );
};

export default Client;
