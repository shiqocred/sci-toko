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
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormView } from "./views/form-view";
import { PendingView } from "./views/pending-view";
import { ApprovedView } from "./views/approved-view";
import { RejectedView } from "./views/rejected-view";

const initialValue = {
  ktp: null as File | null,
  kta: null as File | null,
  nik: "",
  no_kta: "",
  full_name: "",
};

const Client = () => {
  const { update } = useSession();
  const router = useRouter();
  const [input, setInput] = useState(initialValue);

  const { mutate: upgrade } = useUpgradeVeterinarian();
  const { mutate: reset } = useReset();

  const { data } = useGetStatusRoleVeterinarian();

  const formStatus = useMemo(() => {
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
    body.append("no_kta", input.no_kta);
    body.append("full_name", input.full_name);
    if (input.ktp) {
      body.append("ktp", input.ktp);
    }
    if (input.kta) {
      body.append("kta", input.kta);
    }

    upgrade({ body });
  };

  const handleReset = (e: MouseEvent) => {
    e.preventDefault();

    reset({});
  };
  const handleActivate = async (e: MouseEvent) => {
    e.preventDefault();

    await update({ role: formStatus?.role });
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
      <div className="w-full flex flex-col items-center py-20 relative z-10">
        {formStatus?.status === null && (
          <FormView
            input={input}
            setInput={setInput}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
          />
        )}
        {formStatus?.status === "PENDING" && <PendingView />}
        {formStatus?.status === "APPROVED" && (
          <ApprovedView handleActivate={handleActivate} />
        )}
        {formStatus?.status === "REJECTED" && (
          <RejectedView
            handleReset={handleReset}
            message={formStatus.message}
          />
        )}
      </div>
    </div>
  );
};

export default Client;
