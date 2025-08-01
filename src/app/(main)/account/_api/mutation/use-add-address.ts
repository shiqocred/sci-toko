import { invalidateQuery, useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Body = {
  name: string;
  phone: string;
  address: string;
  province: string;
  city: string;
  district: string;
  longitude: string;
  latitude: string;
  detail: string;
  postal_code: string;
  is_default: boolean;
};

export const useAddAddress = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const mutation = useMutate<Body>({
    endpoint: "/user/addresses",
    method: "post",
    onSuccess: async ({ data }) => {
      toast.success(data.message);
      router.push("/account?tab=address");
      await invalidateQuery(queryClient, [["addresses"]]);
    },
    onError: {
      title: "ADD_ADDRESS",
    },
  });

  return mutation;
};
