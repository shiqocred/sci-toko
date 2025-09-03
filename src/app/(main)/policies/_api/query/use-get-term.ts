import { useApiQuery } from "@/lib/query/use-query";

type Response = {
  data: string;
};

export const useGetTermOfUse = () => {
  const query = useApiQuery<Response>({
    key: ["term-of-use"],
    endpoint: `/homepage/policies/terms`,
  });
  return query;
};
