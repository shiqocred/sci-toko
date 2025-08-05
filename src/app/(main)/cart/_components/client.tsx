"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn, formatRupiah, numericString, sizesImage } from "@/lib/utils";
import { Minus, Plus, Trash2 } from "lucide-react";
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
import { useDebounce } from "@/hooks/use-debounce";
import { DialogRemoveProduct } from "./_dialogs";
import { useConfirm } from "@/hooks/use-confirm";
import { CheckedState } from "@radix-ui/react-checkbox";

const Client = () => {
  const [input, setInput] = useState({
    variantId: "",
    qty: "",
  });
  const [inputField, setInputField] = useState({
    variantId: "",
    qty: "",
  });
  const [dialog, setDialog] = useState("");

  const [DeleteDialog, confirmDelete] = useConfirm(
    "Delete Product From Cart?",
    "This action cannot be undone",
    "destructive"
  );

  const debounceQty = useDebounce(input.qty);
  const [isMounted, setIsMounted] = useState(false);

  const { mutate: updateQty, isPending: isUpdating } = useUpdateQuantity();
  const { mutate: deleteCart, isPending: isDeleting } = useDeleteCart();
  const { mutate: checkCart, isPending: isChecking } = useUpdateCheck();
  const { mutate: checkout, isPending: isCheckouting } = useCreateCheckout();

  const { data } = useGetCarts();

  const dataCart = useMemo(() => {
    return data?.data;
  }, [data]);
  const carts = useMemo(() => {
    return data?.data.products;
  }, [data]);

  const handleIncrease = (id: string, newQty?: number) => {
    setInput((prev) => ({
      variantId: id,
      qty: newQty
        ? (newQty + 1).toString()
        : (parseFloat(prev.qty) + 1).toString(),
    }));
  };

  const handleReduce = (id: string, newQty?: number) => {
    setInput((prev) => ({
      variantId: id,
      qty: newQty
        ? (newQty - 1).toString()
        : (parseFloat(prev.qty) - 1).toString(),
    }));
  };

  const handleUpdateQty = (variantId: string, qty: string, onSuccess?: any) => {
    updateQty(
      {
        params: { variantId },
        body: { qty },
      },
      { onSuccess }
    );
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
    checkout({});
  };

  useEffect(() => {
    if (!!input.variantId && !!input.qty) {
      if (parseFloat(input.qty) > 0) {
        handleUpdateQty(
          input.variantId,
          input.qty,
          setInput({ qty: "", variantId: "" })
        );
      } else {
        setDialog(input.variantId);
      }
    }
  }, [debounceQty]);

  useEffect(() => {
    if (!isMounted) {
      setIsMounted(true);
    }
  }, []);
  if (!isMounted) return;
  return (
    <div className="bg-sky-50 h-full">
      <DeleteDialog />
      <DialogRemoveProduct
        open={!!dialog}
        onOpenChange={() => {
          if (dialog) {
            setDialog("");
            setInputField({ qty: "", variantId: "" });
            setInput({ qty: "", variantId: "" });
          }
        }}
        onSubmit={() =>
          handleUpdateQty(dialog, "0", () => {
            setInput({ qty: "", variantId: "" });
            setInputField({ qty: "", variantId: "" });
            setDialog("");
          })
        }
      />
      <div className="max-w-[1240px] mx-auto w-full flex flex-col gap-7 px-4 lg:px-8 py-14">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold ">Your Cart</h1>
          <p className="text-gray-500">({dataCart?.total_cart})</p>
        </div>
        <div className="w-full grid grid-cols-7 gap-6">
          <div className="col-span-5 w-full">
            <div className="flex flex-col gap-4">
              {carts &&
                carts.map((cart) => (
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
                              handleChecked([`${cart.default_variant.id}`], e);
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
                    {cart.default_variant && (
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-3 w-44 flex-none">
                          <div className="flex items-center">
                            <Button
                              variant={"outline"}
                              size={"icon"}
                              className="rounded-r-none disabled:opacity-100 group"
                              onClick={() => {
                                if (isNaN(parseFloat(input.qty))) {
                                  handleReduce(
                                    cart.default_variant?.id ?? "",
                                    cart.default_variant?.quantity ?? 0
                                  );
                                } else {
                                  handleReduce(cart.default_variant?.id ?? "");
                                }
                              }}
                            >
                              <Minus className="group-disabled:opacity-50" />
                            </Button>
                            <input
                              className="h-9 focus-visible:outline-0 text-center w-14 border-y"
                              type="number"
                              value={
                                inputField.qty
                                  ? inputField.qty
                                  : cart.default_variant.quantity
                              }
                              onFocus={() =>
                                setInputField({
                                  variantId: cart.default_variant?.id ?? "",
                                  qty: (
                                    cart.default_variant?.quantity ?? 0
                                  ).toString(),
                                })
                              }
                              onChange={(e) =>
                                setInputField({
                                  variantId: cart.default_variant?.id ?? "",
                                  qty: isNaN(parseFloat(e.target.value))
                                    ? "0"
                                    : numericString(e.target.value),
                                })
                              }
                              onBlur={() => {
                                if (inputField.qty === "0") {
                                  setDialog(cart.default_variant?.id ?? "");
                                } else if (
                                  parseFloat(inputField.qty) !==
                                  cart.default_variant?.quantity
                                ) {
                                  handleUpdateQty(
                                    inputField.variantId,
                                    inputField.qty,
                                    setInputField({
                                      qty: "",
                                      variantId: "",
                                    })
                                  );
                                }
                              }}
                            />
                            <Button
                              variant={"outline"}
                              size={"icon"}
                              className="rounded-l-none disabled:opacity-100 group"
                              onClick={() => {
                                if (isNaN(parseFloat(input.qty))) {
                                  handleIncrease(
                                    cart.default_variant?.id ?? "",
                                    cart.default_variant?.quantity ?? 0
                                  );
                                } else {
                                  handleIncrease(
                                    cart.default_variant?.id ?? ""
                                  );
                                }
                              }}
                            >
                              <Plus className="group-disabled:opacity-50" />
                            </Button>
                          </div>
                          <Button
                            className=" hover:bg-red-50 text-destructive hover:text-destructive size-8"
                            variant={"ghost"}
                            size={"icon"}
                            onClick={() =>
                              handleDelete(cart.default_variant?.id ?? "")
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
                                  handleChecked([`${item.id}`], e)
                                }
                              />
                            </div>
                            <p className="w-full">{item.name}</p>
                            <div className="flex items-center gap-3 w-44 flex-none">
                              <div className="flex items-center">
                                <Button
                                  variant={"outline"}
                                  size={"icon"}
                                  className="rounded-r-none disabled:opacity-100 group"
                                  onClick={() => {
                                    if (isNaN(parseFloat(input.qty))) {
                                      handleReduce(
                                        item.id ?? "",
                                        item.quantity ?? 0
                                      );
                                    } else {
                                      handleReduce(item.id ?? "");
                                    }
                                  }}
                                >
                                  <Minus className="group-disabled:opacity-50" />
                                </Button>
                                <input
                                  className="h-9 focus-visible:outline-0 text-center w-14 border-y"
                                  type="number"
                                  value={
                                    inputField.qty
                                      ? inputField.qty
                                      : item.quantity
                                  }
                                  onFocus={() =>
                                    setInputField({
                                      variantId: item.id ?? "",
                                      qty: (item.quantity ?? 0).toString(),
                                    })
                                  }
                                  onChange={(e) =>
                                    setInputField({
                                      variantId: item.id ?? "",
                                      qty: isNaN(parseFloat(e.target.value))
                                        ? "0"
                                        : numericString(e.target.value),
                                    })
                                  }
                                  onBlur={() => {
                                    if (inputField.qty === "0") {
                                      setDialog(cart.default_variant?.id ?? "");
                                    } else if (
                                      parseFloat(inputField.qty) !==
                                      item.quantity
                                    ) {
                                      handleUpdateQty(
                                        inputField.variantId,
                                        inputField.qty,
                                        setInputField({
                                          qty: "",
                                          variantId: "",
                                        })
                                      );
                                    }
                                  }}
                                />
                                <Button
                                  variant={"outline"}
                                  size={"icon"}
                                  className="rounded-l-none disabled:opacity-100 group"
                                  onClick={() => {
                                    if (isNaN(parseFloat(input.qty))) {
                                      handleIncrease(
                                        item.id ?? "",
                                        item.quantity ?? 0
                                      );
                                    } else {
                                      handleIncrease(item.id ?? "");
                                    }
                                  }}
                                >
                                  <Plus className="group-disabled:opacity-50" />
                                </Button>
                              </div>
                              <Button
                                className=" hover:bg-red-50 text-destructive hover:text-destructive size-8"
                                variant={"ghost"}
                                size={"icon"}
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
          </div>
          <div className="w-full col-span-2">
            <div className="bg-white shadow rounded-lg p-5 flex flex-col gap-4 text-sm">
              <div className="flex justify-between items-center text-gray-500">
                <p>Subtotal ({dataCart?.total_cart_selected})</p>
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
                    className="rounded-r-none border-r-0 shadow-none bg-gray-50 placeholder:text-xs focus-visible:ring-0"
                  />
                  <Button className="rounded-l-none shadow-none bg-green-600 hover:bg-green-700">
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
                className="w-full flex-auto rounded-full"
                variant={"destructive"}
                disabled={dataCart && dataCart.total_cart_selected < 1}
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
