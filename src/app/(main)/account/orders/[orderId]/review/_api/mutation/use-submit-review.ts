import { invalidateQuery, useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";

type Body = FormData;

type Params = {
  id: string;
};

export const useSubmitReview = () => {
  const queryClient = useQueryClient();
  const mutation = useMutate<Body, Params>({
    endpoint: "/orders/:id/review",
    method: "post",
    onSuccess: async ({ data }) => {
      console.log(data.data.orderId);
      await invalidateQuery(queryClient, [["review", data.data.orderId]]);
    },
    onError: {
      title: "SUBMIT_REVIEW",
    },
  });

  return mutation;
};
