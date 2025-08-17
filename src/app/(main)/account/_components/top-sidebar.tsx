"use client";

import React, { useMemo } from "react";
import { Profile } from "./profile";
import { useGetUser } from "../_api";
import { UpgradeRole } from "./upgrade-role";

export const TopSidebar = () => {
  const { data, isPending } = useGetUser();

  const user = useMemo(() => data?.data, [data]);
  return (
    <div className="flex flex-col gap-4">
      <Profile user={user} loading={isPending} />
      <UpgradeRole user={user} loading={isPending} />
    </div>
  );
};
