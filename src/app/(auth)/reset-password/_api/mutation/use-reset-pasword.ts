import { useMutate } from "@/lib/query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Body = {
  password: string;
  confirm_password: string;
  token: string;
};

export const useResetPassword = () => {
  const router = useRouter();

  const mutation = useMutate<Body>({
    endpoint: "/auth/reset-password",
    method: "post",
    onSuccess: ({ data }) => {
      toast.success(data.message);
      router.push(`/sign-in`);
    },
    onError: {
      title: "RESEND_OTP",
    },
  });

  return mutation;
};
