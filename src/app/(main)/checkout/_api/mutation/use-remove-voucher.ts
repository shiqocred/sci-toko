import { invalidateQuery, useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useRemoveVoucher = () => {
  const queryClient = useQueryClient();
  const mutation = useMutate({
    endpoint: "/checkout/discounts",
    method: "delete",
    onSuccess: async ({ data }) => {
      await invalidateQuery(queryClient, [["checkout"]]);
      toast.success(data.message);
    },
    onError: {
      title: "REMOVE_VOUCHER",
    },
  });

  return mutation;
};
