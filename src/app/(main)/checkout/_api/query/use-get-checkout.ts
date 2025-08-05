import { useApiQuery } from "@/lib/query/use-query";

type Response = {
  data: {
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
};

export const useGetCheckout = () => {
  const query = useApiQuery<Response>({
    key: ["checkout"],
    endpoint: `/checkout`,
  });
  return query;
};
