import { invalidateQuery, useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type Params = {
  id: string;
};

export const useSetDefaultAddress = () => {
  const queryClient = useQueryClient();
  const mutation = useMutate<undefined, Params>({
    endpoint: "/user/addresses/:id/default",
    method: "put",
    onSuccess: async ({ data }) => {
      toast.success(data.message);
      await invalidateQuery(queryClient, [
        ["addresses"],
        ["address", data.data.id],
      ]);
    },
    onError: {
      title: "SET_DEFAULT_ADDRESS",
    },
  });

  return mutation;
};
