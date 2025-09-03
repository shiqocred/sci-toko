import { useApiQuery } from "@/lib/query/use-query";

type Response = {
  data: string;
};

export const useGetContact = () => {
  const query = useApiQuery<Response>({
    key: ["contact"],
    endpoint: `/homepage/contact-us`,
  });
  return query;
};
