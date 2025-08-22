import { Ongkir } from "../../_api";

// types/checkout.ts
export type Address = {
  id: string;
  name: string;
  phone: string;
  detail: string;
  address: string;
  isDefault: boolean;
  latitude: number;
  longitude: number;
};

export type ProductVariant = {
  id: string;
  name: string;
  price: string;
  qty: string;
};

export type Product = {
  id: string;
  title: string;
  image: string | null;
  default_variant: ProductVariant | undefined;
  variants: ProductVariant[];
};

export type OngkirData = {
  express?: Ongkir;
  regular?: Ongkir;
  economy?: Ongkir;
};
