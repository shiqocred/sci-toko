"use client";

import React, { useMemo } from "react";
import { Profile } from "./profile";
import { useGetUser } from "../_api";
import { UpgradeRole } from "./upgrade-role";

export const TopSidebar = () => {
  const { data, isPending } = useGetUser();

  const user = useMemo(() => data?.data, [data]);
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-1 gap-2 lg::gap-4 px-3 pt-3 lg::pt-0 lg::px-0">
      <Profile user={user} loading={isPending} />
      <UpgradeRole user={user} loading={isPending} />
    </div>
  );
};
