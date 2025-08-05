// components/checkout/CheckoutButton.tsx
import { Button } from "@/components/ui/button";

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
      Checkout
    </Button>
  );
}
