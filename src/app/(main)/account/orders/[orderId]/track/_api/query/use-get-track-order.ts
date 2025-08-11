import { useApiQuery } from "@/lib/query/use-query";

type HistoriesExist = {
  id: string;
  updatedAt: Date | null;
  status:
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
  shippingId: string;
  note: string | null;
  serviceType: string | null;
};

type Response = {
  data: HistoriesExist[];
};

export const useGetOrderTrack = ({ orderId }: { orderId: string }) => {
  const query = useApiQuery<Response>({
    key: ["order-track", orderId],
    endpoint: `/orders/${orderId}/track`,
    enabled: !!orderId,
  });
  return query;
};
