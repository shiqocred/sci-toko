import { invalidateQuery, useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";

type Body = { variant_ids: string[]; checked: boolean };

export const useUpdateCheck = () => {
  const queryClient = useQueryClient();
  const mutation = useMutate<Body>({
    endpoint: "/carts",
    method: "put",
    onSuccess: async () => {
      await invalidateQuery(queryClient, [["carts"]]);
    },
    onError: {
      title: "UPDATE_CHECK_CART",
    },
  });

  return mutation;
};
