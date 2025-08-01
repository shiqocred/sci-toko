import { invalidateQuery, useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type Body = { variant_ids: string[]; checked: boolean };

export const useUpdateCheck = () => {
  const queryClient = useQueryClient();
  const mutation = useMutate<Body>({
    endpoint: "/carts",
    method: "put",
    onSuccess: async ({ data }) => {
      toast.success(data.message);
      await invalidateQuery(queryClient, [["carts"]]);
    },
    onError: {
      title: "UPDATE_CHECK_CART",
    },
  });

  return mutation;
};
