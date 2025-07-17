import { useMutate } from "@/lib/query";
import { toast } from "sonner";

type Body = {
  name: string;
  email: string;
  password: string;
  confirm_password: string;
  phone_number: string;
};

export const useRegister = () => {
  const mutation = useMutate<Body>({
    endpoint: "/auth/register",
    method: "post",
    onSuccess: ({ data }) => {
      toast.success(data.message);
    },
    onError: {
      title: "REGISTER",
    },
  });

  return mutation;
};
