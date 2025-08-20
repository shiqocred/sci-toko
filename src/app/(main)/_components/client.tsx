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

const Client = () => {
  const { data } = useGetHomepage();

  const dataHome = useMemo(() => {
    return data?.data;
  }, [data]);

  return (
    <div className="bg-sky-50  pb-16">
      <HeroSection data={dataHome?.banners ?? []} />
      <AnimalsSection />
      <TrendingSection data={dataHome?.products ?? []} />
      <PromoSection data={dataHome?.promos ?? []} />
      <ByCategorySection data={dataHome?.categories ?? []} />
      <BySupplierSection data={dataHome?.suppliers ?? []} />
    </div>
  );
};

export default Client;
