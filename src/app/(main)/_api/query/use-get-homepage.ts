import { useApiQuery } from "@/lib/query/use-query";

type Response = {
  data: {
    products: any[];
    suppliers: any[];
    categories: any[];
  };
};

export const useGetHomepage = () => {
  const query = useApiQuery<Response>({
    key: ["homepage"],
    endpoint: `/homepage`,
  });
  return query;
};
