import { invalidateQuery, useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";

type Body = {
  voucher: string;
};

export const useAddVoucher = () => {
  const queryClient = useQueryClient();
  const mutation = useMutate<Body>({
    endpoint: "/checkout/discounts",
    method: "post",
    onSuccess: async () => {
      await invalidateQuery(queryClient, [["checkout"]]);
    },
    onError: {
      title: "ADD_VOUCHER",
    },
  });

  return mutation;
};
