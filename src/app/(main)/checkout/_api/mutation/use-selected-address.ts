import { invalidateQuery, useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type Body = { addressId: string };

export const useSelectedAddress = () => {
  const queryClient = useQueryClient();
  const mutation = useMutate<Body>({
    endpoint: "/checkout",
    method: "put",
    onSuccess: async ({ data }) => {
      toast.success(data.message);
      await invalidateQuery(queryClient, [["ongkir"], ["checkout"]]);
    },
    onError: {
      title: "SELECTED_ADDRESS",
    },
  });

  return mutation;
};
