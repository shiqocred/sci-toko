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

type HistoriesExist = {
  id: string;
  updatedAt: Date | null;
  status: HistoryStatus;
  shippingId: string;
  note: string | null;
  serviceType: string | null;
};

type Response = {
  data: {
    id: string;
    product_price: string;
    total_price: string;
    status: string;
    userId: string;
    name: string;
    email: string;
    image: string | null;
    toal_orders: string;
    invoice_status: string;
    paymentChannel: string | null;
    paymentMethod: string | null;
    amount: string;
    expiredAt: string | null;
    cancelledAt: string | null;
    paidAt: string | null;
    shipping_name: string;
    shipping_phone: string;
    shipping_address: string;
    shipping_address_note: string;
    shipping_latitude: string;
    shipping_longitude: string;
    shipping_id: string | null;
    shipping_waybill_id: string | null;
    shipping_courier_name: string;
    shipping_courierCompany: string;
    shipping_courierType: string;
    shipping_price: string;
    shipping_duration: string;
    shipping_fastest: string;
    shipping_longest: string;
    shipping_status: string;
    payment_formatted: string;
    products: ProductOutput[];
    history: HistoriesExist | null;
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
