import { invalidateQuery, useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type Body = FormData;

export const useUpgradePetShop = () => {
  const queryClient = useQueryClient();
  const mutation = useMutate<Body>({
    endpoint: "/upgrade-role/petshop",
    method: "put",
    onSuccess: async ({ data }) => {
      toast.success(data.message);
      await invalidateQuery(queryClient, [["status-app-petshop"]]);
    },
    onError: {
      title: "REGISTER",
    },
  });

  return mutation;
};
