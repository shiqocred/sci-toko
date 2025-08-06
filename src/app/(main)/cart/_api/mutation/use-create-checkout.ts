import { invalidateQuery, useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export const useCreateCheckout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const mutation = useMutate({
    endpoint: "/checkout",
    method: "post",
    onSuccess: async () => {
      await invalidateQuery(queryClient, [["carts"], ["checkout"], ["ongkir"]]);
      router.push("/checkout");
    },
    onError: {
      title: "CREATE_CHECKOUT",
    },
  });

  return mutation;
};
