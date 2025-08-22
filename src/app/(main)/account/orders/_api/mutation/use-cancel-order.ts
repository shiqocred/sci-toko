import { invalidateQuery, useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type Params = {
  id: string;
};

export const useCancelOrder = () => {
  const queryClient = useQueryClient();
  const mutation = useMutate<undefined, Params>({
    endpoint: "/orders/:id",
    method: "put",
    onSuccess: async ({ data }) => {
      toast.success(data.message);
      await invalidateQuery(queryClient, [["orders"], ["order", data.data.id]]);
    },
    onError: {
      title: "CANCEL_ORDER",
    },
  });

  return mutation;
};
