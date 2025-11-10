// components/checkout/CheckoutButton.tsx
import { Button } from "@/components/ui/button";
import { Loader2, Send } from "lucide-react";

interface Props {
  disabled: boolean;
  onClick: () => void;
  selectedAddress: boolean;
  shipping: string;
}

export function CheckoutButton({
  disabled,
  onClick,
  selectedAddress,
  shipping,
}: Props) {
  return (
    <Button
      variant="destructive"
      disabled={disabled || !selectedAddress || !shipping}
      onClick={onClick}
      className="w-full"
    >
      {disabled ? <Loader2 className="animate-spin" /> : <Send />}
      Checkout
    </Button>
  );
}
