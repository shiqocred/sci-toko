import { invalidateQuery, useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type Body = {
  variant_id: string;
  quantity: string;
};

export const useAddToCart = () => {
  const queryClient = useQueryClient();
  const mutation = useMutate<Body>({
    endpoint: "/carts",
    method: "post",
    onSuccess: async ({ data }) => {
      toast.success(data.message);
      await invalidateQuery(queryClient, [["carts"]]);
    },
    onError: {
      title: "ADD_ADDRESS",
    },
  });

  return mutation;
};
