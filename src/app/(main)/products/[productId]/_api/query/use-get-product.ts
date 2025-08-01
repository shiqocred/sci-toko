import { useApiQuery } from "@/lib/query/use-query";

type Response = {
  data: {
    name: string;
    description: string;
    indication: string;
    dosage_usage: string;
    packaging: string;
    registration_number: string;
    storage_instruction: string;
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
      oldPrice: [string] | [string, string];
      newPrice: [string] | [string, string];
      discount: string;
    };
    variants:
      | {
          id: string;
          name: string;
          old_price: string;
          new_price: string;
          stock: string;
          weight: string;
          discount: string;
        }[]
      | null;
    default_variant: {
      id: string;
      old_price: string;
      new_price: string;
      stock: string;
      weight: string;
      discount: string;
    } | null;
  };
};

export const useGetProduct = ({ productId }: { productId: string }) => {
  const query = useApiQuery<Response>({
    key: ["product", productId],
    endpoint: `/products/${productId}`,
  });
  return query;
};
