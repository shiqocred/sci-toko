import { useApiQuery } from "@/lib/query/use-query";

type Response = {
  data: {
    question: string;
    answer: string;
  }[];
};

export const useGetFaqs = ({ q }: { q: string }) => {
  const query = useApiQuery<Response>({
    key: ["faqs", { q }],
    endpoint: `/homepage/faqs?q=${q}`,
  });
  return query;
};
