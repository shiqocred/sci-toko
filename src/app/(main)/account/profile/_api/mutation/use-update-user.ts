import { invalidateQuery, useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type Body = FormData;

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  const mutation = useMutate<Body>({
    endpoint: "/user",
    method: "put",
    onSuccess: async ({ data }) => {
      toast.success(data.message);
      await invalidateQuery(queryClient, [["user"]]);
    },
    onError: {
      title: "UPDATE_USER",
    },
  });

  return mutation;
};
