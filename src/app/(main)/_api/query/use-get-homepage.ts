import { useApiQuery } from "@/lib/query/use-query";

export type ProductProps = {
  image: string | null;
  title: string;
  slug: string;
  description: string;
  totalSold: number;
  avgRating: number;
};

export type SupplierCategoryPromoProps = {
  image: string | null;
  name: string;
  slug: string;
};

export type BannerProps = {
  type: "DETAIL" | "PETS" | "PROMOS" | "SUPPLIERS" | "CATEGORIES";
  name: string;
  image: string | null;
  target: {
    name: string;
    slug: string;
  }[];
};

type Response = {
  data: {
    products: ProductProps[];
    suppliers: SupplierCategoryPromoProps[];
    categories: SupplierCategoryPromoProps[];
    banners: BannerProps[];
    promos: SupplierCategoryPromoProps[];
  };
};

export const useGetHomepage = () => {
  const query = useApiQuery<Response>({
    key: ["homepage"],
    endpoint: `/homepage`,
  });
  return query;
};
