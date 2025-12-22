import { invalidateQuery, useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type Body = {
  voucher: string;
};

export const useAddVoucher = () => {
  const queryClient = useQueryClient();
  const mutation = useMutate<Body>({
    endpoint: "/checkout/discounts",
    method: "post",
    onSuccess: async ({ data }) => {
      await invalidateQuery(queryClient, [["checkout"]]);
      toast.success(data.message);
    },
    onError: {
      title: "ADD_VOUCHER",
    },
  });

  return mutation;
};
