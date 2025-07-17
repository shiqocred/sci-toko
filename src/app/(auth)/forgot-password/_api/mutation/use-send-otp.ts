import { useMutate } from "@/lib/query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Body = {
  email: string;
};

export const useSendOTP = () => {
  const router = useRouter();

  const mutation = useMutate<Body>({
    endpoint: "/auth/forgot-password",
    method: "post",
    onSuccess: ({ data }) => {
      toast.success(data.message);
      router.push(
        `/forgot-password/verify?email=${encodeURIComponent(data.data.email)}`
      );
    },
    onError: {
      title: "RESEND_OTP",
    },
  });

  return mutation;
};
