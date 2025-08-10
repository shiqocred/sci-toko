// components/checkout/CheckoutButton.tsx
import { Button } from "@/components/ui/button";
import { Loader2, Send } from "lucide-react";

interface Props {
  disabled: boolean;
  onClick: () => void;
}

export function CheckoutButton({ disabled, onClick }: Props) {
  return (
    <Button
      variant="destructive"
      disabled={disabled}
      onClick={onClick}
      className="w-full"
    >
      {disabled ? <Loader2 className="animate-spin" /> : <Send />}
      Checkout
    </Button>
  );
}
