import { useApiQuery } from "@/lib/query/use-query";

export type ValueFiltersProps = {
  name: string;
  slug: string;
};

export type FiltersProps = {
  suppliers: ValueFiltersProps[];
  categories: ValueFiltersProps[];
  pets: ValueFiltersProps[];
  promos: ValueFiltersProps[];
};

type Response = {
  data: FiltersProps;
};

export const useGetFilters = () => {
  const query = useApiQuery<Response>({
    key: ["products-filters"],
    endpoint: `/products/filters`,
  });
  return query;
};
