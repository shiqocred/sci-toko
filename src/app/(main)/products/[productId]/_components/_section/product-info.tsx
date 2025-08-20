// components/product/ProductInfo.tsx
"use client";

import { useState, useEffect, MouseEvent } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { StarIcon, Tag, PawPrint, Minus, Plus, Loader2 } from "lucide-react";
import { cn, formatRupiah, numericString } from "@/lib/utils";
import { ProductDetailProps, useAddToCart, Variant } from "../../_api";
import { DialogAddedToCart } from "../_dialogs";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Props for the ProductInfo component
interface ProductInfoProps {
  product: ProductDetailProps;
}

export const ProductInfo = ({ product }: ProductInfoProps) => {
  const { status } = useSession();
  const router = useRouter();
  // --- State ---
  const [input, setInput] = useState({ quantity: "1", variant_id: "" });

  const [dialog, setDialog] = useState(false);

  const [data, setData] = useState({
    stock: "AVAILABLE",
    oldPrice: "OLD PRICE",
    newPrice: "NEW PRICE",
    discount: "DISCOUNT",
  });

  const { mutate: addToCart, isPending: isAddingToCart } = useAddToCart();

  const handleAddToCart = (e: MouseEvent) => {
    e.preventDefault();
    if (status === "authenticated") {
      addToCart(
        { body: input },
        {
          onSuccess: () => {
            setDialog(true);
            setInput({ variant_id: "", quantity: "1" });
          },
        }
      );
    } else {
      router.push("/sign-in");
    }
  };

  const subtotal = !isNaN(parseFloat(data.newPrice))
    ? formatRupiah(parseFloat(input.quantity) * parseFloat(data.newPrice))
    : "-";

  const isSame = data.oldPrice === data.newPrice;
  const isNoPrice = Number(data.newPrice) < 1;
  const available = product.available;

  const priceFormatted = (type: "old" | "new") => {
    // price selected
    const price = type === "old" ? data.oldPrice : data.newPrice;
    // data variant
    const dataVariant =
      type === "old"
        ? product?.data_variant.oldPrice
        : product?.data_variant.newPrice;

    if (available) {
      if (product.default_variant) {
        return formatRupiah(price);
      } else if (product.variants && product.variants.length > 0) {
        if (isNaN(parseFloat(price))) {
          return dataVariant.map((item) => formatRupiah(item)).join(" - ");
        } else {
          return formatRupiah(price);
        }
      }
    } else {
      if (isNaN(parseFloat(price))) {
        return product?.data_variant.oldPrice
          .map((item) => formatRupiah(item))
          .join(" - ");
      } else {
        return formatRupiah(data.oldPrice);
      }
    }
  };

  const discountFormatted = () => {
    const discountDefault = product?.data_variant.discount;
    const discountNew = isNaN(parseFloat(data.discount))
      ? `-${discountDefault}%`
      : `-${data.discount}%`;
    if (
      parseFloat(discountDefault ?? "0") > 0 ||
      parseFloat(data.discount) > 0
    ) {
      return (
        <Badge className="py-0 px-1 rounded-sm text-[10px] font-bold">
          {discountNew}
        </Badge>
      );
    }
  };

  const handleSelectVariant = (item: Variant) => {
    setInput((prev) => ({
      ...prev,
      variant_id: item.id,
    }));
    setData({
      stock: item.stock,
      oldPrice: item.old_price,
      newPrice: item.new_price,
      discount: item.discount,
    });
  };

  const handleQuantity = (type: "increase" | "reduce") => {
    setInput((prev) => ({
      ...prev,
      quantity:
        type === "increase"
          ? (parseFloat(prev.quantity) + 1).toString()
          : (parseFloat(prev.quantity) - 1).toString(),
    }));
  };

  useEffect(() => {
    if (isNaN(parseFloat(input.quantity)) || parseFloat(input.quantity) < 1) {
      setInput((prev) => ({ ...prev, quantity: "1" }));
    }
  }, [input]);

  useEffect(() => {
    const isDefaultVariant = product.default_variant;
    if (isDefaultVariant) {
      setInput((prev) => ({ ...prev, variant_id: isDefaultVariant.id }));
      setData({
        stock: isDefaultVariant.stock,
        oldPrice: isDefaultVariant.old_price,
        newPrice: isDefaultVariant.new_price,
        discount: isDefaultVariant.discount,
      });
    }
  }, [product]);

  return (
    <div className="w-full flex flex-col">
      <DialogAddedToCart open={dialog} onOpenChange={setDialog} />
      <div className="flex flex-col gap-4 bg-white shadow rounded-lg p-5 ">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold">{product?.name}</h2>
          <div className="flex items-center gap-3">
            <StarIcon className="size-4 fill-yellow-400 text-transparent" />
            <div className="flex items-center text-xs gap-2 text-gray-500">
              <span>4.8</span>
              <span className="h-4 w-px bg-gray-500" />
              <span>100 Sold</span>
            </div>
          </div>
          <div className="flex items-center flex-wrap gap-2">
            <Badge
              variant={"outline"}
              className="px-3 py-1 rounded border-gray-500 text-gray-500 gap-2"
              asChild
            >
              <Link href={`/products?categories=${product?.category.slug}`}>
                <Tag />
                {product?.category.name}
              </Link>
            </Badge>
            {product?.pets.map((item) => (
              <Badge
                key={item.name}
                variant={"outline"}
                className="px-3 py-1 rounded border-gray-500 text-gray-500 gap-2"
                asChild
              >
                <Link href={`/products?pets=${item.slug}`}>
                  <PawPrint />
                  {item.name}
                </Link>
              </Badge>
            ))}
          </div>
        </div>
        <Separator className="bg-gray-500" />
        <div className="flex flex-col gap-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <p className="text-xl font-bold">{priceFormatted("new")}</p>
              {available && !isSame && !isNoPrice && discountFormatted()}
            </div>
            {available && !isSame && !isNoPrice && (
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-500 line-through">
                  {priceFormatted("old")}
                </p>
              </div>
            )}
          </div>
          {product?.variants && product?.variants.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {product.variants.map((item) => (
                <Button
                  key={item.id}
                  size={"sm"}
                  variant={"outline"}
                  className={cn(
                    "text-xs",
                    item.id === input.variant_id && "border-gray-500"
                  )}
                  disabled={parseFloat(item.stock) < 1}
                  onClick={() => handleSelectVariant(item)}
                >
                  {item.name}
                </Button>
              ))}
            </div>
          )}
          <div className="flex items-center gap-3">
            {available && (
              <div className="flex items-center">
                <Button
                  variant={"outline"}
                  size={"icon"}
                  className="rounded-r-none disabled:opacity-100 group"
                  disabled={parseFloat(input.quantity) <= 1}
                  onClick={() => handleQuantity("reduce")}
                >
                  <Minus className="group-disabled:opacity-50" />
                </Button>
                <input
                  className="h-9 focus-visible:outline-0 text-center w-14 border-y"
                  type="number"
                  value={input.quantity}
                  onChange={(e) =>
                    setInput((prev) => ({
                      ...prev,
                      quantity:
                        parseFloat(e.target.value) >= parseFloat(data.stock)
                          ? parseFloat(data.stock).toString()
                          : numericString(e.target.value),
                    }))
                  }
                />
                <Button
                  variant={"outline"}
                  size={"icon"}
                  className="rounded-l-none disabled:opacity-100 group"
                  onClick={() => handleQuantity("increase")}
                  disabled={
                    parseFloat(input.quantity) === parseFloat(data.stock)
                  }
                >
                  <Plus className="group-disabled:opacity-50" />
                </Button>
              </div>
            )}
            <p
              className={cn(
                "text-xs",
                isNaN(parseFloat(data.stock)) && "font-semibold"
              )}
            >
              {!isNaN(parseFloat(data.stock)) && "Stock: "}
              {data.stock}
            </p>
          </div>
          {available && (
            <div className="flex items-center justify-between text-sm gap-2">
              <p>Subtotal</p>
              <p className="font-semibold text-lg">{subtotal}</p>
            </div>
          )}
          <Button
            variant={"destructive"}
            className="flex-auto w-full rounded-full"
            onClick={handleAddToCart}
            disabled={
              ((!input.variant_id || parseFloat(data.stock) < 1) &&
                status === "authenticated") ||
              !available
            }
          >
            {isAddingToCart && <Loader2 className="animate-spin" />}
            {status === "authenticated" && available && "Add to Cart"}
            {status === "unauthenticated" && available && "Sign in"}
            {status === "authenticated" &&
              !available &&
              `Available for ${product.availableFor
                .map((i) => {
                  if (i === "BASIC") {
                    return "Pet Owner";
                  } else if (i === "PETSHOP") {
                    return "Pet Shop";
                  } else if (i === "VETERINARIAN") {
                    return "Vet Clinic";
                  }
                })
                .join(" & ")}`}
          </Button>
        </div>
      </div>
    </div>
  );
};
