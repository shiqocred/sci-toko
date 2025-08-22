import { invalidateQuery, useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";

export const useRemoveVoucher = () => {
  const queryClient = useQueryClient();
  const mutation = useMutate({
    endpoint: "/checkout/discounts",
    method: "delete",
    onSuccess: async () => {
      await invalidateQuery(queryClient, [["checkout"]]);
    },
    onError: {
      title: "REMOVE_VOUCHER",
    },
  });

  return mutation;
};
