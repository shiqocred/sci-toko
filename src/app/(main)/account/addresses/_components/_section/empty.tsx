import { Button } from "@/components/ui/button";
import { LocateOff, PlusCircle } from "lucide-react";

export const EmptyState = ({
  setAddress,
}: {
  setAddress: (obj: { address: string; id?: string }) => void;
}) => (
  <div className="flex flex-col gap-4">
    <div className="flex p-3 border border-red-500 rounded-md gap-3 items-center">
      <div className="size-9 rounded-full border flex-none border-red-500 flex items-center justify-center">
        <LocateOff className="text-red-500 size-5 flex-none " />
      </div>
      <div className="flex flex-col w-full">
        <h5 className="font-semibold text-red-500 text-lg">
          You don&apos;t have a shipping address yet!
        </h5>
        <p className="text-gray-700 text-sm">
          Add your address now to ensure a smooth and timely delivery.
        </p>
      </div>
    </div>
    <Button
      onClick={() => setAddress({ address: "create" })}
      className="w-auto mx-auto text-xs rounded-full !px-4 bg-green-100 text-green-700 font-semibold hover:bg-green-200"
      size={"sm"}
    >
      <PlusCircle className="size-3.5 stroke-[2.5]" />
      Add Address
    </Button>
  </div>
);
