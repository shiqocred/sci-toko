"use client";

import {
  AnimalsSection,
  ByCategorySection,
  BySupplierSection,
  HeroSection,
  PromoSection,
  TrendingSection,
} from "./_sections";

const Client = () => {
  return (
    <div className="bg-sky-50  pb-16">
      <HeroSection />
      <AnimalsSection />
      <TrendingSection />
      <PromoSection />
      <ByCategorySection />
      <BySupplierSection />
    </div>
  );
};

export default Client;
