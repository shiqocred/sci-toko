"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn, formatRupiah, numericString, sizesImage } from "@/lib/utils";
import {
  Loader,
  Loader2,
  Minus,
  Plus,
  ShoppingBag,
  ShoppingBasket,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";
import {
  useCreateCheckout,
  useDeleteCart,
  useGetCarts,
  useSendOTP,
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
import {
  SwipeableList,
  SwipeableListItem,
  SwipeAction,
  TrailingActions,
  Type as ListType,
} from "react-swipeable-list";
import "react-swipeable-list/dist/styles.css";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const Client = () => {
  const [dialog, setDialog] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [localQty, setLocalQty] = useState<Record<string, number>>({});
  const router = useRouter();
  const [available, setAvailable] = useState(false);
  const [carted, setCarted] = useQueryState(
    "carted",
    parseAsString.withDefault("")
  );
  const [access, setAccess] = useQueryState(
    "access",
    parseAsString.withDefault("")
  );
  const [DeleteDialog, confirmDelete] = useConfirm(
    "Delete Product From Cart?",
    "This action cannot be undone",
    "destructive"
  );

  const [VerifyDialog, confirmVerify] = useConfirm(
    "Restricted Access, Email Not Verified",
    "Please verify your email address to order",
    "destructive",
    "Verify"
  );

  const { mutate: sendOTP, isPending: isSendingOTP } = useSendOTP();
  const { mutate: updateQty, isPending: isUpdatingQty } = useUpdateQuantity();
  const { mutate: deleteCart, isPending: isDeleting } = useDeleteCart();
  const { mutate: checkCart, isPending: isChecking } = useUpdateCheck();
  const { mutate: checkout, isPending: isChekouting } = useCreateCheckout();
  const { data, isPending } = useGetCarts();

  const isLoading =
    isPending || isUpdatingQty || isDeleting || isChecking || isChekouting;

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
      // cek apakah variantId masih ada di carts
      const product =
        carts?.find(
          (c) =>
            c.default_variant?.id === variantId ||
            c.variants?.some((v) => v.id === variantId)
        ) ?? null;

      if (!product) return; // kalau sudah dihapus, skip

      const originalQty =
        product.default_variant?.id === variantId
          ? product.default_variant?.quantity
          : (product.variants?.find((v) => v.id === variantId)?.quantity ?? 0);

      if (
        qty !== originalQty &&
        qty > 0 &&
        carted !== "checkouted" &&
        !isTyping
      ) {
        updateQty({
          params: { variantId },
          body: { qty: String(qty) },
        });
      }
    });
  }, [debouncedLocalQty, carts, updateQty, isTyping, carted]);

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
        return prev; // jangan ubah qty dulu
      }
      return { ...prev, [variantId]: updated };
    });
  };

  const handleQtyChange = (variantId: string, value: string) => {
    setLocalQty((prev) => ({
      ...prev,
      [variantId]: parseFloat(numericString(value)),
    }));
  };

  const handleQtyBlur = (variantId: string) => {
    setIsTyping(false);
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
    checkout(
      {},
      {
        onSuccess: () => setCarted("checkouted"),
        onError: (err) => err.status === 403 && handleSendOTP(),
      }
    );
  };

  const handleSendOTP = async () => {
    const ok = await confirmVerify();
    if (!ok) return;
    sendOTP(
      {},
      {
        onSuccess: () => {
          router.push("/verification-email?from=account");
        },
      }
    );
  };

  useEffect(() => {
    if (carted === "checkouted") {
      setAvailable(true);
      setTimeout(() => {
        setAvailable(false);
      }, 5000);
    }
  }, [carted]);

  useEffect(() => {
    if (access === "403") {
      toast.error("Email not verified");
      setAccess("");
    }
  }, [access]);

  if (access === "403") {
    return (
      <div className="lg:col-span-5 bg-white rounded-lg shadow p-5 flex justify-center items-center h-40 md:h-[400px] flex-col gap-2">
        <Loader className="size-5 md:size-6 animate-spin" />
        <p className="ml-2 animate-pulse text-sm md:text-base">Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-sky-50 h-full relative">
      <VerifyDialog />
      <DeleteDialog />
      <DialogRemoveProduct
        open={!!dialog}
        onOpenChange={() => {
          if (dialog) {
            setLocalQty((prev) => ({
              ...prev,
              [dialog]: 1,
            }));
            setDialog("");
          }
        }}
        onSubmit={() => {
          updateQty({
            params: { variantId: dialog },
            body: { qty: "0" },
          });
          setDialog("");
        }}
      />
      <div className="max-w-[1240px] mx-auto w-full flex flex-col gap-3 md:gap-5 lg:gap-7 px-4 lg:px-8 py-10 md:py-14 ">
        <div className="flex items-center gap-2">
          <h1 className="text-xl md:text-3xl font-bold">Your Cart</h1>
          <p className="text-gray-500 text-sm md:text-base">
            ({dataCart?.total_cart ?? 0})
          </p>
        </div>
        {carted === "checkouted" ? (
          <div className="w-full h-40 md:h-[300px] flex items-center justify-center flex-col gap-2">
            <Loader className="size-5 md:size-6 animate-spin" />
            <p className="ml-2 animate-pulse text-sm md:text-base">
              Redirecting...
            </p>
            <Button
              className="mt-5"
              onClick={() => setCarted("")}
              disabled={available}
            >
              Back to cart
            </Button>
          </div>
        ) : (
          <div className="w-full grid lg:grid-cols-7 gap-6">
            {/* CART LIST */}
            {isPending || isSendingOTP ? (
              <div className="lg:col-span-5 bg-white rounded-lg shadow p-5 flex justify-center items-center h-40 md:h-[400px] flex-col gap-2">
                <Loader className="size-5 md:size-6 animate-spin" />
                <p className="ml-2 animate-pulse text-sm md:text-base">
                  Loading...
                </p>
              </div>
            ) : (
              <div className="lg:col-span-5 pb-32">
                <div className="w-full flex flex-col gap-6">
                  {carts && carts.length > 0 ? (
                    <div className="w-full">
                      <div className="hidden lg:flex flex-col gap-4">
                        {carts.map((cart) => (
                          <div
                            key={cart.slug}
                            className={cn(
                              "flex px-5 py-3 gap-3 bg-white rounded-lg shadow text-sm",
                              cart.default_variant ? "items-center" : "flex-col"
                            )}
                          >
                            <div className="flex items-center w-full gap-3">
                              <div className="flex justify-center flex-none w-6">
                                <Checkbox
                                  disabled={isLoading}
                                  className="data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500"
                                  checked={
                                    cart.default_variant?.checked ??
                                    cart.variants?.every((item) => item.checked)
                                  }
                                  onCheckedChange={(e) => {
                                    if (cart.default_variant) {
                                      handleChecked(
                                        [cart.default_variant.id],
                                        e
                                      );
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
                                    src={
                                      cart.image ??
                                      `/assets/images/logo-sci.png`
                                    }
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
                                      disabled={isLoading}
                                      onClick={() =>
                                        handleReduce(
                                          cart.default_variant?.id ?? "0"
                                        )
                                      }
                                    >
                                      <Minus />
                                    </Button>
                                    <input
                                      className="h-9 text-center w-14 border-y"
                                      type="number"
                                      disabled={isLoading}
                                      value={
                                        localQty[cart.default_variant.id]
                                          ?.toString()
                                          .replace(/^0+(?=\d)/, "") ??
                                        cart.default_variant.quantity
                                          ?.toString()
                                          .replace(/^0+(?=\d)/, "")
                                      }
                                      onFocus={() => setIsTyping(true)}
                                      onChange={(e) =>
                                        handleQtyChange(
                                          cart.default_variant?.id ?? "0",
                                          e.target.value
                                        )
                                      }
                                      onBlur={() =>
                                        handleQtyBlur(
                                          cart.default_variant?.id ?? "0"
                                        )
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
                                        disabled={
                                          isLoading ||
                                          (localQty[cart.default_variant.id] ??
                                            cart.default_variant.quantity) >=
                                            cart.default_variant.stock
                                        }
                                        className="rounded-l-none disabled:opacity-100 disabled:hover:bg-white disabled:pointer-events-auto disabled:cursor-not-allowed"
                                        onClick={() =>
                                          handleIncrease(
                                            cart.default_variant?.id ?? "0"
                                          )
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
                                    disabled={isLoading}
                                    onClick={() =>
                                      handleDelete(
                                        cart.default_variant?.id ?? "0"
                                      )
                                    }
                                  >
                                    {isDeleting ? (
                                      <Loader2 className="animate-spin" />
                                    ) : (
                                      <Trash2 />
                                    )}
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
                                        disabled={isLoading}
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
                                          disabled={isLoading}
                                          onClick={() => handleReduce(item.id)}
                                        >
                                          <Minus />
                                        </Button>
                                        <input
                                          className="h-9 text-center w-14 border-y"
                                          type="number"
                                          disabled={isLoading}
                                          value={
                                            localQty[item.id]
                                              ?.toString()
                                              .replace(/^0+(?=\d)/, "") ??
                                            item.quantity
                                              ?.toString()
                                              .replace(/^0+(?=\d)/, "")
                                          }
                                          onChange={(e) =>
                                            handleQtyChange(
                                              item.id,
                                              e.target.value
                                            )
                                          }
                                          onBlur={() => handleQtyBlur(item.id)}
                                        />
                                        <TooltipText
                                          value={"Maximum available stock"}
                                          className={cn(
                                            "hidden",
                                            (localQty[item.id] ??
                                              item.quantity) >= item.stock &&
                                              "flex"
                                          )}
                                        >
                                          <Button
                                            variant="outline"
                                            size="icon"
                                            className="rounded-l-none disabled:opacity-100 disabled:hover:bg-white disabled:pointer-events-auto disabled:cursor-not-allowed"
                                            onClick={() =>
                                              handleIncrease(item.id)
                                            }
                                            disabled={
                                              isLoading ||
                                              (localQty[item.id] ??
                                                item.quantity) >= item.stock
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
                                        disabled={isLoading}
                                      >
                                        {isDeleting ? (
                                          <Loader2 className="animate-spin" />
                                        ) : (
                                          <Trash2 />
                                        )}
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
                      <SwipeableList
                        fullSwipe={false}
                        type={ListType.IOS}
                        className="flex flex-col gap-4 lg:hidden !overflow-visible"
                      >
                        {carts.map((cart) => {
                          if (cart.default_variant) {
                            return (
                              <SwipeableListItem
                                key={cart.slug}
                                listType={ListType.IOS}
                                trailingActions={trailingActions({
                                  handleDelete: () =>
                                    handleDelete(
                                      cart.default_variant?.id ?? "0"
                                    ),
                                })}
                                className="flex px-5 py-3 gap-3 bg-white rounded-lg shadow text-sm"
                              >
                                <div className="flex items-start w-full gap-3">
                                  <div className="flex items-center gap-3">
                                    <div className="flex justify-center flex-none w-6">
                                      <Checkbox
                                        disabled={isLoading}
                                        className="data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500"
                                        checked={cart.default_variant?.checked}
                                        onCheckedChange={(e) => {
                                          if (cart.default_variant) {
                                            handleChecked(
                                              [cart.default_variant.id],
                                              e
                                            );
                                          } else if (cart.variants) {
                                            handleChecked(
                                              cart.variants.map(
                                                (item) => item.id
                                              ),
                                              e
                                            );
                                          }
                                        }}
                                      />
                                    </div>
                                    <div className="relative h-20 aspect-square border rounded-md">
                                      <Image
                                        fill
                                        src={
                                          cart.image ??
                                          `/assets/images/logo-sci.png`
                                        }
                                        alt="product"
                                        sizes={sizesImage}
                                        className="object-contain"
                                      />
                                    </div>
                                  </div>
                                  <div className="flex flex-col gap-1 w-full">
                                    <Link
                                      href={`/products/${cart.slug}`}
                                      className="line-clamp-1 text-base hover:underline hover:underline-offset-2"
                                    >
                                      {cart.name}
                                    </Link>
                                    <p className="">
                                      {formatRupiah(cart.default_variant.price)}
                                    </p>
                                    <div className="flex items-center gap-3 w-44 flex-none">
                                      <div className="flex items-center">
                                        <Button
                                          variant="outline"
                                          size="icon"
                                          className="rounded-r-none size-8 md:size-9"
                                          disabled={isLoading}
                                          onClick={() =>
                                            handleReduce(
                                              cart.default_variant?.id ?? "0"
                                            )
                                          }
                                        >
                                          <Minus />
                                        </Button>
                                        <input
                                          className="h-8 md:h-9 text-center w-14 border-y focus-visible:outline-none"
                                          type="number"
                                          disabled={isLoading}
                                          value={
                                            localQty[cart.default_variant.id]
                                              ?.toString()
                                              .replace(/^0+(?=\d)/, "") ??
                                            cart.default_variant.quantity
                                              ?.toString()
                                              .replace(/^0+(?=\d)/, "")
                                          }
                                          onFocus={() => setIsTyping(true)}
                                          onChange={(e) =>
                                            handleQtyChange(
                                              cart.default_variant?.id ?? "0",
                                              e.target.value
                                            )
                                          }
                                          onBlur={() =>
                                            handleQtyBlur(
                                              cart.default_variant?.id ?? "0"
                                            )
                                          }
                                        />
                                        <TooltipText
                                          value={"Maximum available stock"}
                                          className={cn(
                                            "hidden",
                                            (localQty[
                                              cart.default_variant.id
                                            ] ??
                                              cart.default_variant.quantity) >=
                                              cart.default_variant.stock &&
                                              "flex"
                                          )}
                                        >
                                          <Button
                                            variant="outline"
                                            size="icon"
                                            disabled={
                                              isLoading ||
                                              (localQty[
                                                cart.default_variant.id
                                              ] ??
                                                cart.default_variant
                                                  .quantity) >=
                                                cart.default_variant.stock
                                            }
                                            className="rounded-l-none disabled:opacity-100 disabled:hover:bg-white disabled:pointer-events-auto disabled:cursor-not-allowed size-8 md:size-9"
                                            onClick={() =>
                                              handleIncrease(
                                                cart.default_variant?.id ?? "0"
                                              )
                                            }
                                          >
                                            <Plus />
                                          </Button>
                                        </TooltipText>
                                      </div>
                                    </div>
                                    <div className="whitespace-nowrap font-semibold w-32 flex-none">
                                      {formatRupiah(cart.default_variant.total)}
                                    </div>
                                  </div>
                                </div>
                              </SwipeableListItem>
                            );
                          }
                          return (
                            <SwipeableListItem
                              key={cart.slug}
                              listType={ListType.IOS}
                              className="flex gap-3 bg-white rounded-lg shadow text-sm flex-col w-full"
                            >
                              <div className="flex flex-col gap-3 w-full">
                                <div className="flex items-center w-full gap-3 px-5 py-3">
                                  <div className="flex justify-center flex-none w-6">
                                    <Checkbox
                                      disabled={isLoading}
                                      className="data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500"
                                      checked={cart.variants?.every(
                                        (item) => item.checked
                                      )}
                                      onCheckedChange={(e) => {
                                        if (cart.default_variant) {
                                          handleChecked(
                                            [cart.default_variant.id],
                                            e
                                          );
                                        } else if (cart.variants) {
                                          handleChecked(
                                            cart.variants.map(
                                              (item) => item.id
                                            ),
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
                                        src={
                                          cart.image ??
                                          `/assets/images/logo-sci.png`
                                        }
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
                                    </div>
                                  </div>
                                </div>
                                <div className="flex w-full flex-col border-t divide-y">
                                  {cart.variants?.map((variant) => (
                                    <SwipeableListItem
                                      key={variant.id}
                                      listType={ListType.IOS}
                                      trailingActions={trailingActions({
                                        handleDelete: () =>
                                          handleDelete(variant.id),
                                      })}
                                      className="w-full"
                                    >
                                      <div className="flex items-center gap-3 px-5 py-3 w-full">
                                        <div className="flex justify-center flex-none w-6">
                                          <Checkbox
                                            className="data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500"
                                            disabled={isLoading}
                                            checked={variant.checked}
                                            onCheckedChange={(e) =>
                                              handleChecked([variant.id], e)
                                            }
                                          />
                                        </div>
                                        <div className="flex flex-col gap-1 w-full">
                                          <p className="w-full">
                                            Variant {variant.name}
                                          </p>
                                          <p className="w-32 flex-none">
                                            {formatRupiah(variant.price)}
                                          </p>
                                          <div className="flex items-center gap-3 w-44 flex-none">
                                            <div className="flex items-center">
                                              <Button
                                                variant="outline"
                                                size="icon"
                                                className="rounded-r-none size-8 md:size-9"
                                                disabled={isLoading}
                                                onClick={() =>
                                                  handleReduce(variant.id)
                                                }
                                              >
                                                <Minus />
                                              </Button>
                                              <input
                                                className="h-8 md:h-9 text-center w-14 border-y focus-visible:outline-none"
                                                type="number"
                                                disabled={isLoading}
                                                value={
                                                  localQty[variant.id]
                                                    ?.toString()
                                                    .replace(/^0+(?=\d)/, "") ??
                                                  variant.quantity
                                                    ?.toString()
                                                    .replace(/^0+(?=\d)/, "")
                                                }
                                                onChange={(e) =>
                                                  handleQtyChange(
                                                    variant.id,
                                                    e.target.value
                                                  )
                                                }
                                                onBlur={() =>
                                                  handleQtyBlur(variant.id)
                                                }
                                              />
                                              <TooltipText
                                                value={
                                                  "Maximum available stock"
                                                }
                                                className={cn(
                                                  "hidden",
                                                  (localQty[variant.id] ??
                                                    variant.quantity) >=
                                                    variant.stock && "flex"
                                                )}
                                              >
                                                <Button
                                                  variant="outline"
                                                  size="icon"
                                                  className="rounded-l-none disabled:opacity-100 disabled:hover:bg-white disabled:pointer-events-auto disabled:cursor-not-allowed size-8 md:size-9"
                                                  onClick={() =>
                                                    handleIncrease(variant.id)
                                                  }
                                                  disabled={
                                                    isLoading ||
                                                    (localQty[variant.id] ??
                                                      variant.quantity) >=
                                                      variant.stock
                                                  }
                                                >
                                                  <Plus />
                                                </Button>
                                              </TooltipText>
                                            </div>
                                          </div>
                                          <div className="whitespace-nowrap font-semibold w-32 flex-none">
                                            {formatRupiah(variant.total)}
                                          </div>
                                        </div>
                                      </div>
                                    </SwipeableListItem>
                                  ))}
                                </div>
                              </div>
                            </SwipeableListItem>
                          );
                        })}
                      </SwipeableList>
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg shadow p-5 flex justify-center items-center h-[300px] md:min-h-[400px] flex-col gap-5">
                      <div className="size-16 md:size-20 lg:size-24 bg-red-500 flex items-center justify-center rounded-full text-white flex-none">
                        <ShoppingBasket className="size-10 md:size-12 lg:size-14 stroke-[1.5]" />
                      </div>
                      <div className="flex flex-col gap-3">
                        <div className="flex flex-col gap-1 text-center">
                          <p className="text-lg md:text-xl font-bold text-red-500">
                            Cart is empty
                          </p>
                          <p className="max-w-lg text-xs md:text-sm text-gray-600">
                            Looks like you haven&apos;t added anything to your
                            cart yet. Start shopping to fill it up with amazing
                            products!
                          </p>
                        </div>
                        <Button
                          variant={"sci"}
                          className="w-fit mx-auto mt-5 !h-8 !px-3 !py-1.5 md:!px-4 md:!h-9 md:!py-2 !gap-1.5 md:!gap-2 text-xs md:text-sm"
                          asChild
                          disabled={isLoading}
                        >
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
                        <h4 className="text-lg md:text-xl font-semibold">
                          Unavailable products
                        </h4>
                      </div>
                      <div className="flex flex-col gap-4">
                        {outOfStock?.map((out) => (
                          <div
                            key={out.slug}
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
                                    src={
                                      out.image ?? `/assets/images/logo-sci.png`
                                    }
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
                                size="sm"
                                disabled={isLoading}
                                onClick={() =>
                                  handleDelete(out.default_variant?.id ?? "0")
                                }
                              >
                                {isDeleting ? (
                                  <Loader2 className="animate-spin" />
                                ) : (
                                  <Trash2 />
                                )}
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
                                    <p className="w-full opacity-50">
                                      {item.name}
                                    </p>
                                    <Button
                                      className="hover:bg-red-50 hover:text-destructive text-destructive"
                                      variant="ghost"
                                      size="sm"
                                      disabled={isLoading}
                                      onClick={() => handleDelete(item.id)}
                                    >
                                      {isDeleting ? (
                                        <Loader2 className="animate-spin" />
                                      ) : (
                                        <Trash2 />
                                      )}
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
              </div>
            )}

            {/* SUMMARY */}
            <div className="w-full lg:col-span-2 fixed z-10 lg:z-auto bottom-0 -mx-4 lg:mx-0 lg:relative lg:bottom-auto">
              <div className="bg-white border lg:border-0 shadow rounded-t-lg md:rounded-lg p-3 md:p-5 flex flex-col gap-3 md:gap-4 text-sm">
                <h3 className="text-base font-semibold">Summary Cart</h3>
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
                    isLoading ||
                    (dataCart &&
                      (dataCart.total_cart_selected < 1 ||
                        !dataCart?.total_cart_selected))
                  }
                  onClick={handleCheckout}
                >
                  {isChekouting ? "Processing..." : "Proceed to Checkout"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Client;

const trailingActions = ({ handleDelete }: { handleDelete: () => void }) => (
  <TrailingActions>
    <SwipeAction onClick={handleDelete}>
      <div className="w-full px-5 flex items-center !justify-center gap-2 bg-red-500 text-white font-medium">
        <Trash2 className="size-4 flex-none" />
        <span>Delete</span>
        <span className="sr-only">delete</span>
      </div>
    </SwipeAction>
  </TrailingActions>
);
