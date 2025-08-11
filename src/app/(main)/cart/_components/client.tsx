"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn, formatRupiah, numericString, sizesImage } from "@/lib/utils";
import { Minus, Plus, ShoppingBag, ShoppingBasket, Trash2 } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";
import {
  useCreateCheckout,
  useDeleteCart,
  useGetCarts,
  useUpdateCheck,
  useUpdateQuantity,
} from "../_api";
import Link from "next/link";
import { DialogRemoveProduct } from "./_dialogs";
import { useConfirm } from "@/hooks/use-confirm";
import { CheckedState } from "@radix-ui/react-checkbox";
import { useDebounce } from "@/hooks/use-debounce";
import { TooltipText } from "@/providers/tooltip-provider";
import { parseAsString, useQueryState } from "nuqs";

const Client = () => {
  const [dialog, setDialog] = useState("");
  const [localQty, setLocalQty] = useState<Record<string, number>>({});
  const [carted, setCarted] = useQueryState(
    "carted",
    parseAsString.withDefault("")
  );
  const [DeleteDialog, confirmDelete] = useConfirm(
    "Delete Product From Cart?",
    "This action cannot be undone",
    "destructive"
  );

  const { mutate: updateQty } = useUpdateQuantity();
  const { mutate: deleteCart } = useDeleteCart();
  const { mutate: checkCart } = useUpdateCheck();
  const { mutate: checkout } = useCreateCheckout();
  const { data } = useGetCarts();

  const dataCart = useMemo(() => data?.data, [data]);
  const carts = useMemo(() => data?.data.products, [data]);
  const outOfStock = useMemo(() => data?.data.out_of_stock, [data]);

  // Sync local qty setiap kali data cart baru datang
  useEffect(() => {
    if (carts) {
      const qtyMap: Record<string, number> = {};
      carts.forEach((cart) => {
        if (cart.default_variant) {
          qtyMap[cart.default_variant.id] = cart.default_variant.quantity;
        }
        cart.variants?.forEach((v) => {
          qtyMap[v.id] = v.quantity;
        });
      });
      setLocalQty(qtyMap);
    }
  }, [carts]);

  // 🔹 DEBOUNCE untuk localQty
  const debouncedLocalQty = useDebounce(localQty, 500);

  // 🔹 Kirim perubahan qty ke server hanya saat debounce selesai
  useEffect(() => {
    Object.entries(debouncedLocalQty).forEach(([variantId, qty]) => {
      // Ambil qty original dari carts
      const originalQty =
        carts?.find(
          (c) =>
            c.default_variant?.id === variantId ||
            c.variants?.some((v) => v.id === variantId)
        )?.default_variant?.quantity ??
        carts?.flatMap((c) => c.variants ?? [])?.find((v) => v.id === variantId)
          ?.quantity ??
        0;

      if (qty !== originalQty && qty > 0 && carted !== "checkouted") {
        updateQty({
          params: { variantId },
          body: { qty: String(qty) },
        });
      }
    });
  }, [debouncedLocalQty, carts, updateQty]);

  const handleIncrease = (variantId: string) => {
    setLocalQty((prev) => ({
      ...prev,
      [variantId]: (prev[variantId] ?? 0) + 1,
    }));
  };

  const handleReduce = (variantId: string) => {
    setLocalQty((prev) => {
      const updated = (prev[variantId] ?? 0) - 1;
      if (updated <= 0) {
        setDialog(variantId);
        return prev;
      }
      return { ...prev, [variantId]: updated };
    });
  };

  const handleQtyChange = (variantId: string, value: string) => {
    setLocalQty((prev) => ({
      ...prev,
      [variantId]: isNaN(parseFloat(value))
        ? 0
        : parseFloat(numericString(value)),
    }));
  };

  const handleQtyBlur = (variantId: string) => {
    const newQty = localQty[variantId];
    if (newQty <= 0) {
      setDialog(variantId);
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await confirmDelete();
    if (!ok) return;
    deleteCart({ params: { variantId: id } });
  };

  const handleChecked = (variantId: string[], checked: CheckedState) => {
    checkCart({
      body: { checked: checked as boolean, variant_ids: variantId },
    });
  };

  const handleCheckout = () => {
    checkout({}, { onSuccess: () => setCarted("checkouted") });
  };

  return (
    <div className="bg-sky-50 h-full">
      <DeleteDialog />
      <DialogRemoveProduct
        open={!!dialog}
        onOpenChange={() => setDialog("")}
        onSubmit={() => {
          updateQty({
            params: { variantId: dialog },
            body: { qty: "0" },
          });
          setDialog("");
        }}
      />
      <div className="max-w-[1240px] mx-auto w-full flex flex-col gap-7 px-4 lg:px-8 py-14">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold">Your Cart</h1>
          <p className="text-gray-500">({dataCart?.total_cart ?? 0})</p>
        </div>
        <div className="w-full grid grid-cols-7 gap-6">
          {/* CART LIST */}
          <div className="col-span-5 w-full flex flex-col gap-6">
            {carts && carts.length > 0 ? (
              <div className="flex flex-col gap-4">
                {carts.map((cart) => (
                  <div
                    key={cart.id}
                    className={cn(
                      "flex px-5 py-3 gap-3 bg-white rounded-lg shadow text-sm",
                      cart.default_variant ? "items-center" : "flex-col"
                    )}
                  >
                    <div className="flex items-center w-full gap-3">
                      <div className="flex justify-center flex-none w-6">
                        <Checkbox
                          className="data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500"
                          checked={
                            cart.default_variant?.checked ??
                            cart.variants?.every((item) => item.checked)
                          }
                          onCheckedChange={(e) => {
                            if (cart.default_variant) {
                              handleChecked([cart.default_variant.id], e);
                            } else if (cart.variants) {
                              handleChecked(
                                cart.variants.map((item) => item.id),
                                e
                              );
                            }
                          }}
                        />
                      </div>
                      <div className="flex items-center w-full gap-2">
                        <div className="relative h-20 aspect-square border rounded-md">
                          <Image
                            fill
                            src={cart.image ?? `/assets/images/logo-sci.png`}
                            alt="product"
                            sizes={sizesImage}
                            className="object-contain"
                          />
                        </div>
                        <div className="flex flex-col">
                          <Link
                            href={`/products/${cart.slug}`}
                            className="line-clamp-1 text-base hover:underline hover:underline-offset-2"
                          >
                            {cart.name}
                          </Link>
                          {cart.default_variant && (
                            <p className="font-semibold">
                              {formatRupiah(cart.default_variant.price)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* DEFAULT VARIANT */}
                    {cart.default_variant && (
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-3 w-44 flex-none">
                          <div className="flex items-center">
                            <Button
                              variant="outline"
                              size="icon"
                              className="rounded-r-none"
                              onClick={() =>
                                handleReduce(cart.default_variant?.id ?? "0")
                              }
                            >
                              <Minus />
                            </Button>
                            <input
                              className="h-9 text-center w-14 border-y"
                              type="number"
                              value={
                                localQty[cart.default_variant.id] ??
                                cart.default_variant.quantity
                              }
                              onChange={(e) =>
                                handleQtyChange(
                                  cart.default_variant?.id ?? "0",
                                  e.target.value
                                )
                              }
                              onBlur={() =>
                                handleQtyBlur(cart.default_variant?.id ?? "0")
                              }
                            />
                            <TooltipText
                              value={"Maximum available stock"}
                              className={cn(
                                "hidden",
                                (localQty[cart.default_variant.id] ??
                                  cart.default_variant.quantity) >=
                                  cart.default_variant.stock && "flex"
                              )}
                            >
                              <Button
                                variant="outline"
                                size="icon"
                                className="rounded-l-none disabled:opacity-100 disabled:hover:bg-white disabled:pointer-events-auto disabled:cursor-not-allowed"
                                onClick={() =>
                                  handleIncrease(
                                    cart.default_variant?.id ?? "0"
                                  )
                                }
                                disabled={
                                  (localQty[cart.default_variant.id] ??
                                    cart.default_variant.quantity) >=
                                  cart.default_variant.stock
                                }
                              >
                                <Plus />
                              </Button>
                            </TooltipText>
                          </div>
                          <Button
                            className="hover:bg-red-50 text-destructive"
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              handleDelete(cart.default_variant?.id ?? "0")
                            }
                          >
                            <Trash2 />
                          </Button>
                        </div>
                        <div className="whitespace-nowrap font-semibold w-32 flex-none">
                          {formatRupiah(cart.default_variant.total)}
                        </div>
                      </div>
                    )}

                    {/* MULTI VARIANT */}
                    {cart.variants && (
                      <div className="flex flex-col border-t divide-y">
                        {cart.variants.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-3 py-3"
                          >
                            <div className="flex justify-center flex-none w-6">
                              <Checkbox
                                className="data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500"
                                checked={item.checked}
                                onCheckedChange={(e) =>
                                  handleChecked([item.id], e)
                                }
                              />
                            </div>
                            <p className="w-full">{item.name}</p>
                            <p className="w-32 flex-none">
                              {formatRupiah(item.price)}
                            </p>
                            <div className="flex items-center gap-3 w-44 flex-none">
                              <div className="flex items-center">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="rounded-r-none"
                                  onClick={() => handleReduce(item.id)}
                                >
                                  <Minus />
                                </Button>
                                <input
                                  className="h-9 text-center w-14 border-y"
                                  type="number"
                                  value={localQty[item.id] ?? item.quantity}
                                  onChange={(e) =>
                                    handleQtyChange(item.id, e.target.value)
                                  }
                                  onBlur={() => handleQtyBlur(item.id)}
                                />
                                <TooltipText
                                  value={"Maximum available stock"}
                                  className={cn(
                                    "hidden",
                                    (localQty[item.id] ?? item.quantity) >=
                                      item.stock && "flex"
                                  )}
                                >
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="rounded-l-none disabled:opacity-100 disabled:hover:bg-white disabled:pointer-events-auto disabled:cursor-not-allowed"
                                    onClick={() => handleIncrease(item.id)}
                                    disabled={
                                      (localQty[item.id] ?? item.quantity) >=
                                      item.stock
                                    }
                                  >
                                    <Plus />
                                  </Button>
                                </TooltipText>
                              </div>
                              <Button
                                className="hover:bg-red-50 text-destructive"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(item.id)}
                              >
                                <Trash2 />
                              </Button>
                            </div>
                            <div className="whitespace-nowrap font-semibold w-32 flex-none">
                              {formatRupiah(item.total)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-5 flex justify-center items-center min-h-[400px] flex-col gap-5">
                <div className="size-24 bg-red-500 flex items-center justify-center rounded-full text-white">
                  <ShoppingBasket className="size-14 stroke-[1.5]" />
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1 text-center">
                    <p className="text-xl font-bold text-red-500">
                      Cart is empty
                    </p>
                    <p className="max-w-lg text-sm text-gray-600">
                      Looks like you haven&apos;t added anything to your cart
                      yet. Start shopping to fill it up with amazing products!
                    </p>
                  </div>
                  <Button variant={"sci"} className="w-fit mx-auto" asChild>
                    <Link href={"/products"}>
                      <ShoppingBag />
                      Browse Products
                    </Link>
                  </Button>
                </div>
              </div>
            )}
            {outOfStock && outOfStock.length > 0 && (
              <>
                <div className="flex items-center gap-2">
                  <h4 className="text-xl font-bold">Unavailable products</h4>
                </div>
                <div className="flex flex-col gap-4">
                  {outOfStock?.map((out) => (
                    <div
                      key={out.id}
                      className={cn(
                        "flex px-5 py-3 gap-3 bg-white rounded-lg shadow text-sm",
                        out.default_variant ? "items-center" : "flex-col"
                      )}
                    >
                      <div className="flex items-center w-full gap-3 opacity-50">
                        <div className="flex items-center w-full gap-2">
                          <div className="relative h-20 aspect-square border rounded-md">
                            <Image
                              fill
                              src={out.image ?? `/assets/images/logo-sci.png`}
                              alt="product"
                              sizes={sizesImage}
                              className="object-contain"
                            />
                          </div>
                          <Link
                            href={`/products/${out.slug}`}
                            className="line-clamp-1 text-base hover:underline hover:underline-offset-2"
                          >
                            {out.name}
                          </Link>
                        </div>
                      </div>

                      {/* DEFAULT VARIANT */}
                      {out.default_variant && (
                        <Button
                          className="hover:bg-red-50 hover:text-destructive text-destructive"
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            handleDelete(out.default_variant?.id ?? "0")
                          }
                        >
                          <Trash2 />
                          Remove
                        </Button>
                      )}

                      {/* MULTI VARIANT */}
                      {out.variants && (
                        <div className="flex flex-col border-t divide-y">
                          {out.variants.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center gap-3 py-3"
                            >
                              <p className="w-full opacity-50">{item.name}</p>
                              <Button
                                className="hover:bg-red-50 hover:text-destructive text-destructive"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(item.id)}
                              >
                                <Trash2 />
                                Remove
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* SUMMARY */}
          <div className="w-full col-span-2">
            <div className="bg-white shadow rounded-lg p-5 flex flex-col gap-4 text-sm">
              <div className="flex justify-between items-center text-gray-500">
                <p>Subtotal ({dataCart?.total_cart_selected ?? 0})</p>
                <p className="font-bold text-black">
                  {formatRupiah(dataCart?.subtotal ?? 0)}
                </p>
              </div>
              <Separator />
              <div className="flex flex-col gap-1.5">
                <Label>Coupon Code</Label>
                <div className="flex items-center">
                  <Input
                    placeholder="Please Enter Code"
                    className="rounded-r-none border-r-0 bg-gray-50 placeholder:text-xs"
                  />
                  <Button className="rounded-l-none bg-green-600 hover:bg-green-700">
                    Apply
                  </Button>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-gray-500">
                <p>Total</p>
                <p className="font-bold text-black">
                  {formatRupiah(dataCart?.total ?? 0)}
                </p>
              </div>
              <Button
                className="w-full rounded-full"
                variant="destructive"
                disabled={
                  dataCart &&
                  (dataCart.total_cart_selected < 1 ||
                    !dataCart?.total_cart_selected)
                }
                onClick={handleCheckout}
              >
                Proceed to Checkout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Client;
