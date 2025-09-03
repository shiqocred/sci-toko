import { useApiQuery } from "@/lib/query/use-query";

type Response = {
  data: string;
};

export const useGetRefundPolicy = () => {
  const query = useApiQuery<Response>({
    key: ["refund-policy"],
    endpoint: `/homepage/policies/refund`,
  });
  return query;
};
