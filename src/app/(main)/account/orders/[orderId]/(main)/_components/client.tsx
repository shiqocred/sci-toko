"use client";

import React, { useMemo } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { id } from "date-fns/locale";

import {
  AddressProps,
  HistoriesExistProps,
  HistoryStatus,
  PaymentProps,
  ProductOutput,
  ShippingProps,
  useGetOrder,
} from "../_api";
import { formatRupiah, sizesImage } from "@/lib/utils";

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
const DeliveryAddress = ({ address }: { address?: AddressProps }) => (
  <div className="flex flex-col border rounded-md border-gray-300 overflow-hidden">
    <div className="p-3 w-full bg-green-50 flex items-center gap-2">
      <MapPinned className="size-4" />
      <h3 className="font-semibold">Delivery Address</h3>
    </div>
    <div className="p-3 border-t border-gray-300 flex flex-col gap-3">
      <div className="w-full flex gap-2 font-medium items-center">
        <p>{address?.name}</p>
        <p>|</p>
        <p className="text-xs md:text-sm">{address?.phone}</p>
      </div>
      <p className="text-gray-600 text-xs md:text-sm">
        {address?.note}, {address?.address}
      </p>
    </div>
  </div>
);

/** Shipping information card */
const ShippingInfo = ({
  orderId,
  shipping,
  history,
}: {
  orderId: string;
  shipping?: ShippingProps;
  history?: HistoriesExistProps | null;
}) => (
  <div className="flex flex-col border rounded-md border-gray-300 overflow-hidden">
    <div className="p-3 w-full bg-green-50 flex md:items-center md:justify-between gap-2 md:gap-3 flex-col md:flex-row">
      <div className="flex items-center gap-2">
        <Truck className="size-4" />
        <h3 className="font-semibold">Shipping Information</h3>
      </div>
      <div className="flex items-center gap-2 text-xs md:text-sm">
        <p>{shipping?.courier_name}</p>
        <p>|</p>
        <p>{shipping?.waybill_id ?? "-"}</p>
      </div>
    </div>
    <div className="p-3 border-y border-gray-300 flex flex-col gap-3">
      {history ? (
        <div className="flex items-center gap-4">
          <HistoryStatusIcon status={history.status} />
          <div className="flex flex-col w-full gap-0.5">
            <p className="font-medium text-xs md:text-sm">{history.note}</p>
            {history.updatedAt && (
              <p className="text-xs text-gray-500">
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
          <p className="font-medium text-xs md:text-sm">
            Order is being prepared for shipment
          </p>
        </div>
      )}
    </div>
    <div className="px-3 py-2 min-h-10 flex items-center justify-between gap-3 text-xs">
      {shipping?.courier_name && (
        <p>
          Estimated delivery {/* Simplify the date display */}
          {shipping.duration}
        </p>
      )}
      {history?.id && (
        <Button
          size="sm"
          variant="link"
          asChild
          className="ml-auto h-7 text-xs !px-0 md:!px-3"
        >
          <Link href={`/account/orders/${orderId}/track`}>
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
    <div className="flex items-center gap-3 p-2 md:p-3">
      <div className="relative h-20 aspect-square border border-gray-300 rounded">
        <Image
          fill
          src={product.image ?? `/assets/images/logo-sci.png`}
          alt={product.name ?? ""}
          sizes={sizesImage}
          className="object-contain"
        />
      </div>
      <div className="flex flex-col justify-between h-20 w-full">
        <p className="line-clamp-2 leading-relaxed font-medium md:font-semibold">
          {product.name}
        </p>
        {product.default_variant && (
          <div className="items-center flex justify-between text-xs md:text-sm">
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
    {product.variant && product.variant.length > 0 && (
      <div className="flex flex-col border-t divide-y border-gray-300">
        {product.variant.map((variant) => (
          <div key={variant.id} className="grid grid-cols-5 gap-3 p-3">
            <div className="flex items-center gap-2 md:gap-3 col-span-2">
              <TagIcon className="size-3 md:size-3.5" />
              <p className="font-semibold line-clamp-1 text-xs md:text-sm">
                {variant.name}
              </p>
            </div>
            <p className="flex items-center col-span-1 text-xs md:text-sm">
              x{parseFloat(variant.quantity ?? "0").toLocaleString()}
            </p>
            <div className="whitespace-nowrap col-span-2 flex-none text-end font-medium text-xs md:text-sm">
              {formatRupiah(variant.price ?? 0)}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

/** Price summary card */
const PriceSummary = ({ payment }: { payment?: PaymentProps }) => (
  <div className="flex flex-col border rounded-md border-gray-300">
    <div className="flex flex-col gap-2 p-3">
      <div className="flex items-center justify-between">
        <p>Subtotal</p>
        <p>{formatRupiah(payment?.subtotal ?? 0)}</p>
      </div>
      <div className="flex items-center justify-between">
        <p>Voucher applied</p>
        <p>-{formatRupiah(payment?.discount ?? 0)}</p>
      </div>
      <div className="flex items-center justify-between">
        <p>Shipping Cost</p>
        <p>{formatRupiah(payment?.shipping_cost ?? 0)}</p>
      </div>
    </div>
    <Separator className="bg-gray-300" />
    <div className="flex items-center p-3 justify-between font-semibold">
      <p>Total Price</p>
      <p>{formatRupiah(payment?.total ?? 0)}</p>
    </div>
    <Separator className="bg-gray-300" />
    <div className="flex flex-col gap-2 p-3">
      <div className="flex items-center justify-between">
        <p>Payment Method</p>
        <p>{payment?.method ?? "-"}</p>
      </div>
      {payment?.status !== "PENDING" && (
        <div className="flex items-center justify-between">
          <p>
            {payment?.status === "PAID" && "Paid at"}
            {payment?.status === "EXPIRED" && "Expired at"}
            {payment?.status === "CANCELLED" && "Canceled at"}:
          </p>
          <p>
            {format(new Date(payment?.timestamp ?? ""), "PPP HH:mm", {
              locale: id,
            })}
          </p>
        </div>
      )}
    </div>
  </div>
);

const Client = () => {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");
  const { orderId } = useParams();
  const { data, isPending } = useGetOrder({ orderId: orderId as string });

  const orderData = data?.data;
  const productsList = useMemo(() => orderData?.products, [orderData]);

  return (
    <div className="bg-white p-3 md:p-5 flex flex-col text-sm gap-4">
      <header className="flex items-center w-full border-b border-gray-400 pb-4">
        <Button size="icon" variant="ghost" className="size-7" asChild>
          <Link href={`/account/orders${tab ? `?tab=${tab}` : ""}`}>
            <ArrowLeft />
          </Link>
        </Button>
        <h4 className="font-bold text-base">Detail Order</h4>
      </header>

      {isPending ? (
        <Loading />
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex md:items-center flex-col md:flex-row gap-2 md:gap-3">
            <Badge
              variant={"outline"}
              className="capitalize px-3 py-1 border-gray-300 font-normal"
            >
              Order no: <span className="font-semibold">{orderData?.id}</span>
            </Badge>
            <OrderStatusBadge status={orderData?.status} />
          </div>
          <section className="flex flex-col gap-4 w-full text-sm">
            <DeliveryAddress address={orderData?.address} />

            <ShippingInfo
              orderId={orderId as string}
              shipping={orderData?.shipping}
              history={orderData?.history}
            />
          </section>

          <section className="flex flex-col gap-2">
            <h3 className="font-semibold text-base">Products List</h3>
            {productsList?.map((product) => (
              <ProductItem key={product.id} product={product} />
            ))}
          </section>

          <PriceSummary payment={orderData?.payment} />
        </div>
      )}
    </div>
  );
};

export default Client;
