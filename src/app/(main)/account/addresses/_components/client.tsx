"use client";

import React, { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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

const initialValue = {
  address: "",
  district: "",
  city: "",
  province: "",
  latitude: "",
  longitude: "",
  postal_code: "",
  detail: "",
  name: "",
  phone: "",
  is_default: false,
};

const Client = () => {
  const router = useRouter();
  const [{ address, id: addressId }, setAddress] = useQueryStates({
    address: parseAsString.withDefault(""),
    id: parseAsString.withDefault(""),
  });

  const [dialCode, setDialCode] = useState("+62");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [input, setInput] = useState({ ...initialValue });

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

  useEffect(() => {
    if (!detailAddress?.data) return;

    const phoneParts = detailAddress.data.phoneNumber.split(" ");
    setInput({
      name: detailAddress.data.name || "",
      phone: phoneParts[1] || "",
      address: detailAddress.data.address || "",
      province: detailAddress.data.province || "",
      city: detailAddress.data.city || "",
      district: detailAddress.data.district || "",
      longitude: detailAddress.data.longitude || "",
      latitude: detailAddress.data.latitude || "",
      detail: detailAddress.data.detail || "",
      postal_code: detailAddress.data.postalCode || "",
      is_default: detailAddress.data.isDefault || false,
    });
    setDialCode(phoneParts[0] || "+62");
  }, [detailAddress]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const payload = {
      ...input,
      phone: `${dialCode} ${input.phone}`,
      is_default: input.is_default as boolean,
    };

    const onSuccess = () => {
      setInput(initialValue);
      router.push("/account/addresses");
    };

    const onError = (data: any) => {
      setErrors(data.response?.data?.errors || {});
    };

    if (address === "create") {
      addAddress({ body: payload }, { onSuccess, onError });
    } else if (address === "edit") {
      updateAddress(
        { body: payload, params: { id: addressId } },
        { onSuccess, onError }
      );
    }
  };

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
      <Header address={address} setAddress={setAddress} />
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
          input={input}
          setInput={setInput}
          dialCode={dialCode}
          setDialCode={setDialCode}
          errors={errors}
          isLoading={isLoading}
          handleSubmit={handleSubmit}
          detailAddress={detailAddress?.data}
        />
      )}
    </div>
  );
};

export default Client;
