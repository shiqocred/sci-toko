import { useApiQuery } from "@/lib/query/use-query";

type Response = {
  data: {
    data: {
      id: string;
      title: string;
      slug: string;
      description: string;
      image: string | null;
    }[];
  };
};

export const useGetProducts = () => {
  const query = useApiQuery<Response>({
    key: ["products"],
    endpoint: `/products`,
  });
  return query;
};
