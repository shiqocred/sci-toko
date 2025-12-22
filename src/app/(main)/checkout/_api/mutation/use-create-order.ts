import { useMutate } from "@/lib/query";
import { toast } from "sonner";

type Body = {
  note: string;
  courierId: string;
};

export const useCreateOrder = () => {
  const mutation = useMutate<Body>({
    endpoint: "/orders",
    method: "post",
    onSuccess: ({ data }) =>
      toast.success(`${data.message}. Redirecting to the payment page…`),
    onError: {
      title: "CREATE_ORDER",
    },
  });

  return mutation;
};
