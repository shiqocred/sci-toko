import { useApiQuery } from "@/lib/query/use-query";

type Response = {
  data: {
    suppliers: {
      name: string;
      slug: string;
    }[];
    categories: {
      name: string;
      slug: string;
    }[];
    pets: {
      name: string;
      slug: string;
    }[];
    promos: {
      name: string;
      slug: string;
    }[];
  };
};

export const useGetFilters = () => {
  const query = useApiQuery<Response>({
    key: ["products-filters"],
    endpoint: `/products/filters`,
  });
  return query;
};
