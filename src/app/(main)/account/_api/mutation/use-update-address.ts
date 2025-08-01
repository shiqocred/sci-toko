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

type Params = {
  id: string;
};

export const useUpdateAddress = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const mutation = useMutate<Body, Params>({
    endpoint: "/user/addresses/:id",
    method: "put",
    onSuccess: async ({ data }) => {
      toast.success(data.message);
      router.push("/account?tab=address");
      await invalidateQuery(queryClient, [
        ["addresses"],
        ["address", data.data.id],
      ]);
    },
    onError: {
      title: "ADD_ADDRESS",
    },
  });

  return mutation;
};
