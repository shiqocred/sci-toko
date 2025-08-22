import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatRupiah, sizesImage } from "@/lib/utils";
import { Check, Clipboard, TagIcon } from "lucide-react";
import Image from "next/image";
import React, { MouseEvent } from "react";
import {
  TransformedOrderGroup,
  useCancelOrder,
  useRepayOrder,
} from "../../_api";
import Link from "next/link";
import { useConfirm } from "@/hooks/use-confirm";

const parseQty = (qty?: string) => Number.parseFloat(qty ?? "0") || 0;

const ProductWithDefaultVariant = ({
  product,
}: {
  product: TransformedOrderGroup["items"][number];
}) => {
  const qty = parseQty(product.default_variant?.variant_qty);
  const price = product.default_variant?.variant_price ?? 0;

  return (
    <div
      key={product.product_id}
      className="flex gap-4 border rounded-md overflow-hidden p-3 border-green-400"
    >
      <div className="relative size-20 rounded overflow-hidden bg-white border border-green-300 flex-none">
        <Image
          alt="product"
          src={product.image ?? "/assets/images/logo-sci.png"}
          fill
          sizes={sizesImage}
          className="object-contain"
        />
      </div>
      <div className="flex flex-col w-full justify-center">
        <h5 className="line-clamp-2 font-bold">{product.product_name}</h5>
        <div className="flex items-center justify-between w-full">
          <p>x{qty.toLocaleString()}</p>
          <p>{formatRupiah(price)}</p>
        </div>
      </div>
    </div>
  );
};

const ProductWithVariants = ({
  product,
}: {
  product: TransformedOrderGroup["items"][number];
}) => {
  return (
    <div
      key={product.product_id}
      className="flex flex-col border rounded-md overflow-hidden border-green-400"
    >
      <div className="flex gap-4 p-3">
        <div className="relative size-20 rounded overflow-hidden bg-white border border-green-300 flex-none">
          <Image
            alt="product"
            src={product.image ?? "/assets/images/logo-sci.png"}
            fill
            sizes={sizesImage}
            className="object-contain"
          />
        </div>
        <div className="flex flex-col justify-center w-full">
          <h5 className="line-clamp-2 font-bold">{product.product_name}</h5>
        </div>
      </div>
      <div className="flex flex-col text-sm">
        {product.variants?.map((variant) => {
          const qty = parseQty(variant.variant_qty);
          const price = variant.variant_price ?? 0;
          return (
            <div
              key={variant.variant_name}
              className="border-t border-green-400 px-3 py-2 grid grid-cols-5"
            >
              <div className="flex items-center gap-2">
                <TagIcon className="size-3" />
                <p className="col-span-2 line-clamp-1 font-semibold">
                  Variant {variant.variant_name}
                </p>
              </div>
              <p className="col-span-1 text-center">x{qty.toLocaleString()}</p>
              <p className="col-span-2 text-end">{formatRupiah(price)}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const OrderList = ({
  order,
  state,
}: {
  order: TransformedOrderGroup;
  state: string;
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async (e: MouseEvent, text: string) => {
    e.preventDefault();
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const [CancelDialog, confirmCancel] = useConfirm(
    "Cancel Selected Order?",
    "This action cannot be undone",
    "destructive"
  );

  const { mutate: cancelOrder, isPending: isCancelling } = useCancelOrder();
  const { mutate: repayOrder, isPending: isRepaying } = useRepayOrder();
  const handleRePay = (e: MouseEvent, id: string) => {
    e.preventDefault();
    repayOrder({ params: { id } });
  };
  const handleCancel = async (e: MouseEvent, id: string) => {
    e.preventDefault();
    const ok = await confirmCancel();
    if (!ok) return;
    cancelOrder({ params: { id } });
  };

  return (
    <Card className="rounded-md shadow-none border-green-400">
      <CancelDialog />
      <CardContent className="flex flex-col w-full">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <p className="text-xs">Order No:</p>
            <div className="flex items-center gap-2">
              <p className="font-semibold">{order.id}</p>
              <Button
                variant="ghost"
                size="icon"
                className="size-6 hover:bg-green-100 disabled:opacity-100"
                onClick={(e) => handleCopy(e, order.id)}
                disabled={copied}
              >
                {copied ? (
                  <Check className="size-3.5 text-gray-600 stroke-3" />
                ) : (
                  <Clipboard className="size-3.5 text-gray-600 stroke-3" />
                )}
              </Button>
            </div>
          </div>
          <p className="uppercase text-green-700 font-medium">
            {state.toUpperCase()}
          </p>
        </div>

        {/* Items */}
        <div className="flex flex-col w-full gap-2 my-4">
          {order.items.map((product) => {
            if (product.default_variant) {
              return (
                <ProductWithDefaultVariant
                  key={product.product_id}
                  product={product}
                />
              );
            } else if (product.variants) {
              return (
                <ProductWithVariants
                  key={product.product_id}
                  product={product}
                />
              );
            }
            return null;
          })}
        </div>

        {/* Footer */}
        <div className="w-full flex flex-col items-end gap-4">
          <div className="flex items-center gap-2">
            <p>Total Order:</p>
            <p className="font-bold text-lg">
              {formatRupiah(order.total_price)}
            </p>
          </div>
          <div className="flex items-center gap-4 justify-between w-full">
            {order.expired && (
              <p className="text-xs text-gray-500">
                Pay before <span className="underline">{order.expired}</span>
              </p>
            )}
            <div className="flex items-center gap-3 ml-auto">
              {state === "unpaid" && (
                <>
                  <Button
                    variant={"sciOutline"}
                    onClick={(e) => handleCancel(e, order.id)}
                    disabled={isRepaying || isCancelling}
                  >
                    {isCancelling ? "Canceling..." : "Cancel Order"}
                  </Button>
                  <Button
                    variant={"sci"}
                    onClick={(e) => handleRePay(e, order.id)}
                    disabled={isRepaying || isCancelling}
                  >
                    {isCancelling ? "Re-Paying..." : "Pay Now"}
                  </Button>
                </>
              )}
              {state === "completed" && (
                <Button
                  variant="sciOutline"
                  onClick={() => alert("Comming soon")}
                >
                  Review
                </Button>
              )}
              {(state === "shipping" || state === "completed") && (
                <Button variant={"sciOutline"}>
                  <Link href={`/account/orders/${order.id}/track`}>
                    Track Order
                  </Link>
                </Button>
              )}
              {state !== "unpaid" && state !== "failed" && (
                <Button
                  variant="sci"
                  onClick={() =>
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }
                  asChild
                >
                  <Link href={`/account/orders/${order.id}?tab=${state}`}>
                    Detail Order
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
