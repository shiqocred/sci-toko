import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPinned } from "lucide-react";

export const Header = ({
  address,
  setAddress,
}: {
  address: string | undefined;
  setAddress: (obj: { address: string; id?: string }) => void;
}) => (
  <div className="flex items-center gap-2">
    {address ? (
      <Button
        size={"icon"}
        onClick={() => setAddress({ address: "", id: "" })}
        variant={"ghost"}
      >
        <ArrowLeft />
      </Button>
    ) : (
      <div className="size-9 flex items-center justify-center">
        <MapPinned className="size-4" />
      </div>
    )}
    <h4 className="font-bold text-lg capitalize">
      {address || "Shipping"} Address
    </h4>
  </div>
);
