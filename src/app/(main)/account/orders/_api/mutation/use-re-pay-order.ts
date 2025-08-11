import { useMutate } from "@/lib/query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Params = {
  id: string;
};

export const useRepayOrder = () => {
  const route = useRouter();
  const mutation = useMutate<undefined, Params>({
    endpoint: "/orders/:id/pay",
    method: "post",
    onSuccess: async ({ data }) => {
      toast.success(data.message);
      route.push(data.data.url);
    },
    onError: {
      title: "RE_PAY_ORDER",
    },
  });

  return mutation;
};
