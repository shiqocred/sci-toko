import { useMutate } from "@/lib/query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Body = {
  otp: string;
  email: string;
};

export const useVerify = () => {
  const router = useRouter();
  const mutation = useMutate<Body>({
    endpoint: "/auth/forgot-password/verify",
    method: "post",
    onSuccess: ({ data }) => {
      toast.success(data.message);
      router.push(
        `/reset-password?token=${encodeURIComponent(data.data.token)}`
      );
    },
    onError: {
      title: "VERIFY_OTP",
    },
  });

  return mutation;
};
