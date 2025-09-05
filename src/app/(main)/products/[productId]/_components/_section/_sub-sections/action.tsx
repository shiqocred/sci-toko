import { useState, useEffect, MouseEvent } from "react";
import { Button } from "@/components/ui/button";
import { cn, formatRupiah, numericString } from "@/lib/utils";
import { DialogAddedToCart } from "../../_dialogs";
import { useRouter } from "next/navigation";
import { ProductDetailProps, useAddToCart, Variant } from "../../../_api";
import { Badge } from "@/components/ui/badge";
import { Loader2, LogInIcon, Minus, Plus } from "lucide-react";
import Link from "next/link";

export const CartAction = ({
  product,
  status,
  setIsDialog,
}: {
  product?: ProductDetailProps;
  status: "authenticated" | "loading" | "unauthenticated";
  setIsDialog?: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
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
  const available = product?.isAvailable;

  const priceFormatted = (type: "old" | "new") => {
    const price = type === "old" ? data.oldPrice : data.newPrice;
    const dataVariant =
      type === "old"
        ? product?.data_variant.oldPrice
        : product?.data_variant.newPrice;

    const formatRange = (variantData?: string[]) =>
      variantData?.map((item) => formatRupiah(item)).join(" - ");

    const formatPrice = (p: string, variantData?: string[]) =>
      isNaN(parseFloat(p)) ? formatRange(variantData) : formatRupiah(p);

    if (!available) {
      return formatPrice(price, product?.data_variant.oldPrice);
    }

    if (product?.default_variant) {
      return formatRupiah(price);
    }

    if (product?.variants && product?.variants.length > 0) {
      return formatPrice(price, dataVariant);
    }

    return "";
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

  console.log(status);

  useEffect(() => {
    if (isNaN(parseFloat(input.quantity)) || parseFloat(input.quantity) < 1) {
      setInput((prev) => ({ ...prev, quantity: "1" }));
    }
  }, [input]);

  useEffect(() => {
    const isDefaultVariant = product?.default_variant;
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
    <div className="flex flex-col gap-4">
      <DialogAddedToCart
        open={dialog}
        onOpenChange={() => {
          setDialog(false);
          setIsDialog?.(false);
        }}
      />
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
          {product?.variants.map((item) => (
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
              disabled={parseFloat(input.quantity) === parseFloat(data.stock)}
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
      {status === "unauthenticated" ? (
        <Button
          variant={"destructive"}
          className="flex-auto w-full rounded-full"
          asChild
        >
          <Link href={"/sign-in"}>
            <LogInIcon />
            Sign in
          </Link>
        </Button>
      ) : (
        <Button
          variant={"destructive"}
          className="flex-auto w-full rounded-full disabled:opacity-100 disabled:pointer-events-auto disabled:cursor-not-allowed disabled:hover:bg-destructive"
          onClick={handleAddToCart}
          disabled={
            ((!input.variant_id || parseFloat(data.stock) < 1) &&
              status === "authenticated") ||
            !available
          }
        >
          {isAddingToCart && <Loader2 className="animate-spin" />}
          {status === "authenticated" && available && "Add to Cart"}
          {status === "authenticated" &&
            !available &&
            `Available for ${product?.availableFor
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
      )}
    </div>
  );
};
