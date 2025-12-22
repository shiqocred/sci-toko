"use client";

import { useMemo } from "react";
import { parseAsString, useQueryStates } from "nuqs";
import { useConfirm } from "@/hooks/use-confirm";
import {
  useAddAddress,
  useDeleteAddress,
  useGetAddress,
  useGetAddresses,
  useSetDefaultAddress,
  useUpdateAddress,
} from "../_api";
import { AddressList } from "./_section/list";
import { Header } from "./_section/header";
import { LoadingState } from "./_section/loading";
import { AddressForm } from "./_section/form";

export interface InputProps {
  address: string;
  district: string;
  city: string;
  province: string;
  latitude: string;
  longitude: string;
  postal_code: string;
  detail: string;
  name: string;
  phone: string;
  is_default: boolean;
}

export type UpdateAddressType = ReturnType<typeof useUpdateAddress>["mutate"];
export type AddAddressType = ReturnType<typeof useAddAddress>["mutate"];
export type DetailAddressType = ReturnType<typeof useGetAddress>["data"];

const Client = () => {
  const [{ address, id: addressId }, setAddress] = useQueryStates({
    address: parseAsString.withDefault(""),
    id: parseAsString.withDefault(""),
  });

  const [DeleteDialog, confirmDelete] = useConfirm(
    "Delete Address?",
    "This action cannot be undone",
    "destructive"
  );

  const { data, isPending } = useGetAddresses();
  const { data: detailAddress, isPending: isPendingDetailAddress } =
    useGetAddress({ id: addressId });

  const { mutate: addAddress, isPending: isAdding } = useAddAddress();
  const { mutate: updateAddress, isPending: isUpdating } = useUpdateAddress();
  const { mutate: deleteAddress, isPending: isDeleting } = useDeleteAddress();
  const { mutate: setDefault, isPending: isSettingDefault } =
    useSetDefaultAddress();

  const isLoading =
    (address === "edit" && !!addressId && isPendingDetailAddress) ||
    isAdding ||
    isUpdating;

  const listAddresses = useMemo(() => data?.data || [], [data]);

  const handleDelete = async (id: string) => {
    if (!(await confirmDelete())) return;
    deleteAddress({ params: { id } });
  };

  const handleSetDefault = (id: string) => {
    setDefault({ params: { id } });
  };

  // --- Render helpers ---
  return (
    <div className="bg-white p-3 md:p-4 lg:p-5 flex flex-col text-sm gap-4">
      <DeleteDialog />
      <Header address={address} setAddress={(v) => setAddress(v)} />
      {!address && (
        <AddressList
          isPending={isPending}
          listAddresses={listAddresses}
          isDeleting={isDeleting}
          isSettingDefault={isSettingDefault}
          setAddress={setAddress}
          handleDelete={handleDelete}
          handleSetDefault={handleSetDefault}
        />
      )}
      {((address === "edit" && !!addressId && isPendingDetailAddress) ||
        isAdding ||
        isUpdating) && <LoadingState />}
      {(address === "create" ||
        (address === "edit" && !!addressId && !isPendingDetailAddress)) && (
        <AddressForm
          addressId={addressId}
          address={address}
          addAddress={addAddress}
          updateAddress={updateAddress}
          isLoading={isLoading}
          detailAddress={detailAddress}
        />
      )}
    </div>
  );
};

export default Client;
