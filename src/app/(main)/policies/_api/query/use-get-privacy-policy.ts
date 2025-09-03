import { useApiQuery } from "@/lib/query/use-query";

type Response = {
  data: string;
};

export const useGetPrivacyPolicy = () => {
  const query = useApiQuery<Response>({
    key: ["privacy-policy"],
    endpoint: `/homepage/policies/privacy`,
  });
  return query;
};
