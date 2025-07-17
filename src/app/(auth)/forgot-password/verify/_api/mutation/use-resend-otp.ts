import { invalidateQuery, useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type Body = {
  email: string;
};

export const useResendOTP = () => {
  const queryClient = useQueryClient();
  const mutation = useMutate<Body>({
    endpoint: "/auth/forgot-password/otp",
    method: "post",
    onSuccess: ({ data }) => {
      toast.success(data.message);
      invalidateQuery(queryClient, [["resend-forgot-password-otp"]]);
    },
    onError: {
      title: "RESEND_OTP",
    },
  });

  return mutation;
};
