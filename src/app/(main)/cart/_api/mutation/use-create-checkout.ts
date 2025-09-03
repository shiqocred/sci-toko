import { invalidateQuery, useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const useCreateCheckout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const mutation = useMutate({
    endpoint: "/checkout",
    method: "post",
    onSuccess: async () => {
      await invalidateQuery(queryClient, [["carts"], ["checkout"], ["ongkir"]]);
      setTimeout(() => router.push("/checkout"), 100);
    },
    errorCustom: (err) => {
      if (err.status !== 403) {
        toast.error(`${(err?.response?.data as any)?.message}`);
      }
      console.log(`ERROR_CREATE_CHECKOUT:`, err);
    },
  });

  return mutation;
};
