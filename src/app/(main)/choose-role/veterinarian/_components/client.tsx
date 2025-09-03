"use client";

import React, {
  ChangeEvent,
  FormEvent,
  MouseEvent,
  useMemo,
  useState,
} from "react";
import {
  useGetStatusRoleVeterinarian,
  useReset,
  useUpgradeVeterinarian,
} from "../_api";
import { useRouter } from "next/navigation";
import { FormView } from "./views/form-view";
import { PendingView } from "./views/pending-view";
import { ApprovedView } from "./views/approved-view";
import { RejectedView } from "./views/rejected-view";
import { Loader2 } from "lucide-react";

const generalValue = {
  personal_id: "",
  veterinarian_id: "",
  full_name: "",
};

const initialValue = {
  personal_id_file: null as File | null,
  veterinarian_id_file: null as File | null,
  ...generalValue,
};

const initialErrors = {
  personal_id_file: "",
  veterinarian_id_file: "",
  ...generalValue,
};

const Client = () => {
  const router = useRouter();
  const [input, setInput] = useState(initialValue);
  const [errors, setErrors] = useState(initialErrors);

  const { mutate: upgrade, isPending: isUpgrading } = useUpgradeVeterinarian();
  const { mutate: reset, isPending: isReseting } = useReset();

  const { data, isPending, refetch, isRefetching } =
    useGetStatusRoleVeterinarian();

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
    body.append("personal_id", input.personal_id);
    body.append("veterinarian_id", input.veterinarian_id);
    body.append("full_name", input.full_name);
    if (input.personal_id_file) {
      body.append("personal_id_file", input.personal_id_file);
    }
    if (input.veterinarian_id_file) {
      body.append("veterinarian_id_file", input.veterinarian_id_file);
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
            <p>Loading...</p>
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
