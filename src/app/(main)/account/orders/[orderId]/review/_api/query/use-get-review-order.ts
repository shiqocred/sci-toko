import { useApiQuery } from "@/lib/query/use-query";

export type Review = {
  title: string;
  rating: number;
  description: string;
  images: string[];
  timestamp: string | null;
};

type Response = {
  data: Review | null;
};

export const useGetReviewTrack = ({ orderId }: { orderId: string }) => {
  const query = useApiQuery<Response>({
    key: ["review", orderId],
    endpoint: `/orders/${orderId}/review`,
    enabled: !!orderId,
  });
  return query;
};
