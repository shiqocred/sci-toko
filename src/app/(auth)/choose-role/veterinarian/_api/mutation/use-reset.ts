import { invalidateQuery, useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useReset = () => {
  const queryClient = useQueryClient();
  const mutation = useMutate({
    endpoint: "/upgrade-role/reset",
    method: "put",
    onSuccess: ({ data }) => {
      toast.success(data.message);
      invalidateQuery(queryClient, [["status-app-veterinarian"]]);
    },
    onError: {
      title: "REGISTER",
    },
  });

  return mutation;
};
