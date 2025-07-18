"use client";

import React, {
  ChangeEvent,
  FormEvent,
  MouseEvent,
  useMemo,
  useState,
} from "react";
import { useGetStatusRolePetshop, useReset, useUpgradePetShop } from "../_api";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormView } from "./views/form-view";
import { PendingView } from "./views/pending-view";
import { ApprovedView } from "./views/approved-view";
import { RejectedView } from "./views/rejected-view";
import { Loader2 } from "lucide-react";

const generalValue = {
  nik: "",
  full_name: "",
};

const initialValue = {
  ktp: null as File | null,
  storefront: null as File | null,
  ...generalValue,
};

const initialErrors = {
  ktp: "",
  storefront: "",
  ...generalValue,
};

const Client = () => {
  const { update } = useSession();
  const router = useRouter();
  const [input, setInput] = useState(initialValue);
  const [errors, setErrors] = useState(initialErrors);

  const { mutate: upgrade, isPending: isUpgrading } = useUpgradePetShop();
  const { mutate: reset, isPending: isReseting } = useReset();

  const { data, isPending, refetch, isRefetching } = useGetStatusRolePetshop();

  const formData = useMemo(() => {
    return data?.data;
  }, [data]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const v = e.target;

    setInput((prev) => ({ ...prev, [v.id]: v.value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const body = new FormData();
    body.append("nik", input.nik);
    body.append("full_name", input.full_name);
    if (input.ktp) {
      body.append("ktp", input.ktp);
    }
    if (input.storefront) {
      body.append("storefront", input.storefront);
    }

    upgrade(
      { body },
      {
        onSuccess: () => {
          setInput(initialValue);
          setErrors(initialErrors);
        },
        onError: (err) => {
          setErrors((err.response?.data as any).errors);
        },
      }
    );
  };

  const handleReset = (e: MouseEvent) => {
    e.preventDefault();

    reset({});
  };
  const handleActivate = async (e: MouseEvent) => {
    e.preventDefault();

    await update({ role: formData?.role });
    router.push("/");
  };
  return (
    <div className="w-full bg-sky-50 relative h-full">
      <div
        className="min-[1440px]:h-[610px] w-full aspect-[1442/610] bg-repeat-x bg-[position:center_bottom] bg-[length:auto_100%] absolute top-0 z-0"
        style={{
          backgroundImage: "url('/assets/images/homepage.webp')",
        }}
      />
      {isPending ? (
        <div className="w-full flex flex-col items-center py-20 relative z-10">
          <div className="max-w-md w-full px-5 py-20 bg-white rounded-2xl flex flex-col gap-1 items-center">
            <Loader2 className="animate-spin" />
            <p>Memuat...</p>
          </div>
        </div>
      ) : (
        <div className="w-full flex flex-col items-center py-20 relative z-10">
          {formData?.status === null && (
            <FormView
              input={input}
              setInput={setInput}
              handleChange={handleChange}
              handleSubmit={handleSubmit}
              errors={errors}
              isUpgrading={isUpgrading}
            />
          )}
          {formData?.status === "PENDING" && (
            <PendingView refetch={refetch} isRefetching={isRefetching} />
          )}
          {formData?.status === "APPROVED" && (
            <ApprovedView handleActivate={handleActivate} data={formData} />
          )}
          {formData?.status === "REJECTED" && (
            <RejectedView
              handleReset={handleReset}
              message={formData.message}
              isReseting={isReseting}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default Client;
