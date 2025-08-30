import { useApiQuery } from "@/lib/query/use-query";

export type CheckoutProps = {
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
  discount: {
    code: string;
    value: string;
  } | null;
  total_discount: number;
  addressId: string | null;
  freeShipping: string;
};

type Response = {
  data: CheckoutProps;
};

export const useGetCheckout = () => {
  const query = useApiQuery<Response>({
    key: ["checkout"],
    endpoint: `/checkout`,
  });
  return query;
};
