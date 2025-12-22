"use client";

import { useSession } from "next-auth/react";
import { FormSection } from "./form";

export type SessionType = ReturnType<typeof useSession>;

const Client = () => {
  const session = useSession();

  return (
    <div className="bg-white p-3 md:p-4 lg:p-5 text-sm gap-4 flex flex-col">
      <h4 className="font-bold text-lg">Basic Info</h4>
      <FormSection session={session} />
    </div>
  );
};

export default Client;
