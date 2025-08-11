import { useMutate } from "@/lib/query";
import { toast } from "sonner";

type Body = {
  old_password: string;
  new_password: string;
  confirm_new_password: string;
};

export const useUpdatePassword = () => {
  const mutation = useMutate<Body>({
    endpoint: "/user/password",
    method: "put",
    onSuccess: ({ data }) => {
      toast.success(data.message);
    },
    onError: {
      title: "UPDATE_PASSWORD",
    },
  });

  return mutation;
};
