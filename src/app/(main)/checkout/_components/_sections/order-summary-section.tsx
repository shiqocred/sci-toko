// components/checkout/OrderSummarySection.tsx
import { ReceiptText } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { formatRupiah } from "@/lib/utils";

interface Props {
  subtotal: number;
  discount: number;
  shippingPrice: string;
  totalPrice: number;
}

export function OrderSummarySection({
  subtotal,
  discount,
  shippingPrice,
  totalPrice,
}: Props) {
  return (
    <div className="w-full rounded-lg shadow p-5 bg-white border flex flex-col gap-4">
      <h3 className="font-semibold text-lg flex items-center gap-2">
        <ReceiptText className="size-5" />
        Order Summary
      </h3>
      <div className="flex flex-col gap-3 text-sm">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p>Subtotal:</p>
            <p className="font-semibold">{formatRupiah(subtotal)}</p>
          </div>
          <div className="flex items-center justify-between ml-2">
            <p>- Discount:</p>
            <p className="font-semibold">- {formatRupiah(discount)}</p>
          </div>
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <p>Shipping Fee:</p>
          <p className="font-semibold">{formatRupiah(shippingPrice)}</p>
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <p>Total Price:</p>
          <p className="font-semibold">{formatRupiah(totalPrice)}</p>
        </div>
      </div>
    </div>
  );
}
