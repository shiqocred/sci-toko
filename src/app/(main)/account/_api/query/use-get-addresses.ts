import { useApiQuery } from "@/lib/query/use-query";

type Response = {
  data: {
    id: string;
    name: string;
    detail: string | null;
    isDefault: boolean;
    phone: string;
    address: string;
  }[];
};

export const useGetAddresses = () => {
  const query = useApiQuery<Response>({
    key: ["addresses"],
    endpoint: `/user/addresses`,
  });
  return query;
};
