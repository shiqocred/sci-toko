import { useMutate } from "@/lib/query";
import { useRouter } from "next/navigation";

type Body = {
  note: string;
  courierId: string;
};

export const useCreateOrder = () => {
  const router = useRouter();
  const mutation = useMutate<Body>({
    endpoint: "/orders",
    method: "post",
    onSuccess: async ({ data }) => {
      setTimeout(() => router.push(data.data.payment_url), 100);
    },
    onError: {
      title: "CREATE_ORDER",
    },
  });

  return mutation;
};
