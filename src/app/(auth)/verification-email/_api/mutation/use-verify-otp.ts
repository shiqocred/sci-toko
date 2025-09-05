import { invalidateQuery, useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Body = {
  otp: string;
};

export const useVerify = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const mutation = useMutate<Body>({
    endpoint: "/auth/verify",
    method: "post",
    onSuccess: async ({ data }) => {
      await invalidateQuery(queryClient, [["user"]]);
      toast.success(data.message);
      router.push("/choose-role");
    },
    onError: {
      title: "VERIFY_OTP",
    },
  });

  return mutation;
};
