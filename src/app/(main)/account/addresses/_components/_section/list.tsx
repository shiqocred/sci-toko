import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { LoadingState } from "./loading";
import { EmptyState } from "./empty";
import { AddressItem } from "./item";

export const AddressList = ({
  isPending,
  listAddresses,
  isDeleting,
  isSettingDefault,
  setAddress,
  handleDelete,
  handleSetDefault,
}: {
  isPending: boolean;
  listAddresses: any[];
  isDeleting: boolean;
  isSettingDefault: boolean;
  setAddress: (obj: { address: string; id?: string }) => void;
  handleDelete: (id: string) => void;
  handleSetDefault: (id: string) => void;
}) => {
  if (isPending) {
    return <LoadingState />;
  }

  if (listAddresses.length === 0) {
    return <EmptyState setAddress={setAddress} />;
  }

  return (
    <div className="flex flex-col gap-4">
      {listAddresses.map((item) => (
        <AddressItem
          key={item.id}
          item={item}
          isDeleting={isDeleting}
          isSettingDefault={isSettingDefault}
          setAddress={setAddress}
          handleDelete={handleDelete}
          handleSetDefault={handleSetDefault}
        />
      ))}
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
};
