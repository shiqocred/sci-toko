import { invalidateQuery, useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useResendOTP = () => {
  const queryClient = useQueryClient();
  const mutation = useMutate({
    endpoint: "/auth/verify/otp",
    method: "post",
    onSuccess: async ({ data }) => {
      toast.success(data.message);
      await invalidateQuery(queryClient, [["resend-otp"]]);
    },
    onError: {
      title: "RESEND_OTP",
    },
  });

  return mutation;
};
