import { invalidateQuery, useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type Body = { qty: string };

type Params = { variantId: string };

export const useUpdateQuantity = () => {
  const queryClient = useQueryClient();
  const mutation = useMutate<Body, Params>({
    endpoint: "/carts/:variantId",
    method: "put",
    onSuccess: async ({ data }) => {
      toast.success(data.message);
      await invalidateQuery(queryClient, [["carts"]]);
    },
    onError: {
      title: "UPDATE_QUANTITY_CART",
    },
  });

  return mutation;
};
