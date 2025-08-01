import { invalidateQuery, useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type Params = { variantId: string };

export const useDeleteCart = () => {
  const queryClient = useQueryClient();
  const mutation = useMutate<undefined, Params>({
    endpoint: "/carts/:variantId",
    method: "delete",
    onSuccess: async ({ data }) => {
      toast.success(data.message);
      await invalidateQuery(queryClient, [["carts"]]);
    },
    onError: {
      title: "DELETE_CART",
    },
  });

  return mutation;
};
