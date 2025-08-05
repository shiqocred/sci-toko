// components/checkout/NoCourierAvailable.tsx
import { MapPinOff } from "lucide-react";

export function NoCourierAvailable() {
  return (
    <div className="h-16 border rounded-md w-full px-3 py-2 flex items-center gap-4 border-red-300">
      <MapPinOff className="size-5 text-red-500" />
      <div>
        <p className="text-sm font-semibold text-red-500">
          No Couriers Available
        </p>
        <p className="text-sm">No delivery service to your area.</p>
      </div>
    </div>
  );
}
