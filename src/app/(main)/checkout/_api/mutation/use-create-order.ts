import { invalidateQuery, useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export const useCreateOrder = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const mutation = useMutate({
    endpoint: "/checkout",
    method: "put",
    onSuccess: async ({ data }) => {
      await invalidateQuery(queryClient, [["carts"], ["checkout"], ["ongkir"]]);
      setTimeout(() => router.push(data.data.payment_url), 100);
    },
    onError: {
      title: "CREATE_ORDER",
    },
  });

  return mutation;
};
