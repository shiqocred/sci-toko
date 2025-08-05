import { invalidateQuery, useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type Params = {
  id: string;
};

export const useDeleteAddress = () => {
  const queryClient = useQueryClient();
  const mutation = useMutate<undefined, Params>({
    endpoint: "/user/addresses/:id",
    method: "delete",
    onSuccess: async ({ data }) => {
      toast.success(data.message);
      await invalidateQuery(queryClient, [["addresses"]]);
    },
    onError: {
      title: "DELETE_ADDRESS",
    },
  });

  return mutation;
};
