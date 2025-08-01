import { useApiQuery } from "@/lib/query/use-query";

type Response = {
  data: {
    id: string;
    name: string;
    phoneNumber: string;
    address: string;
    detail: string;
    province: string;
    city: string;
    district: string;
    postalCode: string;
    longitude: string;
    latitude: string;
    isDefault: boolean;
  };
};

export const useGetAddress = ({ id }: { id: string }) => {
  const query = useApiQuery<Response>({
    key: ["address", id],
    endpoint: `/user/addresses/${id}`,
    enabled: !!id,
  });
  return query;
};
