import { useApiQuery } from "@/lib/query/use-query";

type Response = {
  data: {
    data: {
      id: string;
      title: string;
      slug: string;
      description: string;
      image: string | null;
      totalSold: number;
      avgRating: number;
    }[];
    pagination: {
      total: number;
      page: number;
      totalPages: number;
    };
  };
};

export const useGetProducts = ({
  categories,
  suppliers,
  pets,
  promos,
  p,
  q,
}: {
  categories?: string[];
  suppliers?: string[];
  pets?: string[];
  promos?: string[];
  p: number;
  q: string;
}) => {
  const query = useApiQuery<Response>({
    key: [
      "products",
      {
        categories,
        suppliers,
        pets,
        promos,
        p,
        q,
      },
    ],
    endpoint: `/products`,
    searchParams: {
      categories,
      suppliers,
      pets,
      promos,
      p,
      q,
    },
  });
  return query;
};
