import { useApiQuery } from "@/lib/query/use-query";

export interface VariantDefault {
  id: string;
  old_price: string;
  new_price: string;
  stock: string;
  weight: string;
  discount: string;
}

export interface Variant extends VariantDefault {
  name: string;
}

export type ProductDetailProps = {
  name: string;
  description: string;
  indication: string;
  dosage_usage: string;
  packaging: string;
  registration_number: string;
  storage_instruction: string;
  isAvailable: boolean;
  availableFor: ("BASIC" | "PETSHOP" | "VETERINARIAN")[];
  supplier: {
    name: string;
    slug: string;
  };
  category: {
    name: string;
    slug: string;
  };
  compositions: {
    value: string;
    name: string;
  }[];
  images: string[];
  pets: {
    name: string;
    slug: string;
  }[];
  data_variant: {
    oldPrice: string[];
    newPrice: string[];
    discount: string;
  };
  variants: Variant[] | null;
  default_variant: VariantDefault | null;
};

type Response = {
  data: ProductDetailProps;
};

export const useGetProduct = ({ productId }: { productId: string }) => {
  const query = useApiQuery<Response>({
    key: ["product", productId],
    endpoint: `/products/${productId}`,
  });
  return query;
};
