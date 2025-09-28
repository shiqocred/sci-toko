import { useApiQuery } from "@/lib/query/use-query";

export type ProductReviewProps = {
  rating: number;
  timestamp: string;
  title: string;
  description: string;
  images: string[];
};

type Response = {
  data: ProductReviewProps[];
};

export const useGetProductReviews = ({ productId }: { productId: string }) => {
  const query = useApiQuery<Response>({
    key: ["product-reviews", productId],
    endpoint: `/products/${productId}/reviews`,
  });
  return query;
};
