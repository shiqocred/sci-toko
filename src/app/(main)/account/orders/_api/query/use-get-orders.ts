import { useApiQuery } from "@/lib/query/use-query";

// --- TYPES ---
type Variant = {
  variant_name: string;
  variant_qty: string;
  variant_price: string;
};

type OrderItem = {
  product_id: string;
  product_name: string;
  image: string | null; // 👈 tetap ada, tapi diisi dari productImages
  default_variant: Variant | null;
  variants: Variant[] | null;
};

export type TransformedOrderGroup = {
  id: string;
  status: string;
  total_price: string;
  expired: string | null;
  items: OrderItem[];
};

type Response = {
  data: {
    unpaid: TransformedOrderGroup[];
    processed: TransformedOrderGroup[];
    shipping: TransformedOrderGroup[];
    completed: TransformedOrderGroup[];
    failed: TransformedOrderGroup[];
  };
};

export const useGetOrders = () => {
  const query = useApiQuery<Response>({
    key: ["orders"],
    endpoint: `/orders`,
  });
  return query;
};
