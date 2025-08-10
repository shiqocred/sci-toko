import { useApiQuery } from "@/lib/query/use-query";

type Response = {
  data: {
    products: {
      id: string;
      name: string | null;
      slug: string | null;
      image: string | null;
      default_variant: {
        id: string;
        name: string;
        quantity: number;
        stock: number;
        checked: boolean;
        price: number;
        total: number;
      } | null;
      variants:
        | {
            id: string;
            name: string;
            quantity: number;
            stock: number;
            checked: boolean;
            price: number;
            total: number;
          }[]
        | null;
    }[];
    out_of_stock: {
      id: string;
      name: string | null;
      slug: string | null;
      image: string | null;
      default_variant: {
        id: string;
        name: string;
        quantity: number;
        stock: number;
        checked: boolean;
        price: number;
        total: number;
      } | null;
      variants:
        | {
            id: string;
            name: string;
            quantity: number;
            stock: number;
            checked: boolean;
            price: number;
            total: number;
          }[]
        | null;
    }[];
    subtotal: number;
    total_cart_selected: number;
    total_cart: number;
    total: number;
  };
};

export const useGetCarts = () => {
  const query = useApiQuery<Response>({
    key: ["carts"],
    endpoint: `/carts`,
  });
  return query;
};
