import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatRupiah, sizesImage } from "@/lib/utils";
import { Check, Clipboard, TagIcon } from "lucide-react";
import Image from "next/image";
import React, { MouseEvent } from "react";
import { TransformedOrderGroup } from "../../../_api";

export const OrderList = ({
  order,
  state,
}: {
  order: TransformedOrderGroup;
  state: "unpaid" | "processed" | "shipping" | "completed" | "failed";
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async (e: MouseEvent, name: string) => {
    e.preventDefault();
    await navigator.clipboard.writeText(name);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <Card className="rounded-md shadow-none border-green-400">
      <CardContent className="flex flex-col w-full">
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
          <p className="uppercase text-green-700 font-medium">UNPAID</p>
        </div>
        <div className="flex flex-col w-full gap-2 my-4">
          {order.items.map((product) => {
            if (product.default_variant) {
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
                    <h5 className="line-clamp-2 font-bold">
                      {product.product_name}
                    </h5>
                    <div className="flex items-center justify-between w-full">
                      <p>
                        x
                        {(
                          parseFloat(product.default_variant.variant_qty) ?? 0
                        ).toLocaleString()}
                      </p>
                      <p>
                        {formatRupiah(product.default_variant.variant_price)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            } else if (product.variants) {
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
                      <h5 className="line-clamp-2 font-bold">
                        {product.product_name}
                      </h5>
                    </div>
                  </div>
                  <div className="flex flex-col text-sm">
                    {product.variants.map((variant) => (
                      <div
                        key={variant.variant_name}
                        className="first:border-t border-green-400 px-3 py-2 grid grid-cols-5"
                      >
                        <div className="flex items-center gap-2">
                          <TagIcon className="size-3" />
                          <p className="col-span-2 line-clamp-1 font-semibold">
                            Variant {variant.variant_name}
                          </p>
                        </div>
                        <p className="col-span-1 text-center">
                          x
                          {(
                            parseFloat(variant.variant_qty) ?? 0
                          ).toLocaleString()}
                        </p>
                        <p className="col-span-2 text-end">
                          {formatRupiah(variant.variant_price)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }
          })}
        </div>
        <div className="w-full flex flex-col items-end gap-4">
          <div className="flex items-center gap-2">
            <p>Total Order:</p>
            <p className="font-bold text-lg">
              {formatRupiah(order.total_price)}
            </p>
          </div>
          {state === "failed" && <Button variant={"sci"}>Buy Again</Button>}
          {state === "unpaid" && <Button variant={"sci"}>Pay Now</Button>}
          {(state === "shipping" || state === "completed") && (
            <Button variant={"sciOutline"}>Track Order</Button>
          )}
          {(state === "shipping" || state === "completed") && (
            <Button variant={"sciOutline"}>Track Order</Button>
          )}
          {state !== "unpaid" && state !== "failed" && (
            <Button variant={state === "processed" ? "sci" : "sciOutline"}>
              Detail Order
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
