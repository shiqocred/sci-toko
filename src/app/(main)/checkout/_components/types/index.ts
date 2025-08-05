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

export type CheckoutData = {
  total_item: number;
  price: number;
  products: {
    id: string;
    title: string;
    image: string | null;
    default_variant:
      | {
          id: string;
          name: string;
          price: string;
          qty: string;
        }
      | undefined;
    variants: {
      id: string;
      name: string;
      price: string;
      qty: string;
    }[];
  }[];
  total_weight: number;
  addressId: string | null;
};

export type Courier = {
  name: string;
  company: string;
  duration: string;
  price: number;
  type: string;
};

export type OngkirData = {
  express?: Courier;
  regular?: Courier;
  economy?: Courier;
};
