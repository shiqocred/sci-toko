import { useApiQuery } from "@/lib/query/use-query";

type Variant = {
  id: string;
  name: string | null;
  price: string;
  quantity: string;
};

export type ProductOutput = {
  id: string | null;
  name: string | null;
  image: string | null;
  default_variant: Variant | null;
  variant: Variant[] | null;
};

export type HistoryStatus =
  | "CONFIRMED"
  | "SCHEDULED"
  | "ALLOCATED"
  | "PICKING_UP"
  | "PICKED"
  | "CANCELLED"
  | "ON_HOLD"
  | "DROPPING_OFF"
  | "RETURN_IN_TRANSIT"
  | "RETURNED"
  | "REJECTED"
  | "DISPOSED"
  | "COURIER_NOT_FOUND"
  | "DELIVERED"
  | "PENDING";

export type HistoriesExistProps = {
  id: string;
  updatedAt: Date | null;
  status: HistoryStatus;
  shippingId: string;
  note: string | null;
  serviceType: string | null;
};

export type PaymentProps = {
  subtotal: string;
  shipping_cost: string;
  total: string;
  status: "CANCELLED" | "PENDING" | "EXPIRED" | "PAID" | null;
  timestamp: Date | null;
  method: string | null;
};
export type AddressProps = {
  name: string | null;
  phone: string | null;
  address: string | null;
  note: string | null;
};
export type ShippingProps = {
  waybill_id: string | null;
  courier_name: string | null;
  duration: string;
  status: string | null;
};

type Response = {
  data: {
    id: string;
    status: string;
    payment: PaymentProps;
    address: AddressProps;
    shipping: ShippingProps;
    products: ProductOutput[];
    history: HistoriesExistProps | null;
  };
};

export const useGetOrder = ({ orderId }: { orderId: string }) => {
  const query = useApiQuery<Response>({
    key: ["order", orderId],
    endpoint: `/orders/${orderId}`,
    enabled: !!orderId,
  });
  return query;
};
