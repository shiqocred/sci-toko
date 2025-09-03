"use client";

import { useMemo } from "react";
import { useGetHomepage } from "../_api";
import {
  AnimalsSection,
  ByCategorySection,
  BySupplierSection,
  HeroSection,
  PromoSection,
  TrendingSection,
} from "./_sections";
import { Loader } from "lucide-react";

const Client = () => {
  const { data, isPending } = useGetHomepage();

  const dataHome = useMemo(() => {
    return data?.data;
  }, [data]);

  return (
    <div className="bg-sky-50  pb-16">
      {isPending ? (
        <div className="w-full flex flex-col h-[calc(100vh-61px)] lg:h-[calc(100vh-69px)] gap-2 items-center justify-center">
          <Loader className="size-5 animate-spin" />
          <p className="text-sm ml-2 animate-pulse">Loading...</p>
        </div>
      ) : (
        <div className="flex w-full flex-col">
          <HeroSection data={dataHome?.banners ?? []} />
          <AnimalsSection />
          <TrendingSection data={dataHome?.products ?? []} />
          <PromoSection data={dataHome?.promos ?? []} />
          <ByCategorySection data={dataHome?.categories ?? []} />
          <BySupplierSection data={dataHome?.suppliers ?? []} />
        </div>
      )}
    </div>
  );
};

export default Client;
