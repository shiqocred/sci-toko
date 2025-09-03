"use client";

import { Loader } from "lucide-react";
import React, { useMemo } from "react";
import { useGetTermOfUse } from "../../_api";

export const Client = () => {
  const { data: term, isPending } = useGetTermOfUse();

  const termRes = useMemo(() => term?.data ?? "", [term]);
  return (
    <div className="w-full flex flex-col gap-4 rounded-lg p-3 lg:p-5 bg-white shadow-sm">
      {isPending ? (
        <div className="w-full flex flex-col h-[300px] gap-2 items-center justify-center">
          <Loader className="size-5 animate-spin" />
          <p className="text-sm ml-2 animate-pulse">Loading...</p>
        </div>
      ) : (
        <div
          className="text-sm text-gray-600 leading-relaxed prose prose-sm max-w-none prose-li:marker:text-black prose-li:marker:font-semibold"
          dangerouslySetInnerHTML={{
            __html: termRes,
          }}
        />
      )}
    </div>
  );
};
