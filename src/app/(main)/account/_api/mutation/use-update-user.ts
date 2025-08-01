import { useMutate } from "@/lib/query";
import { toast } from "sonner";

type Body = FormData;

export const useUpdateUser = () => {
  const mutation = useMutate<Body>({
    endpoint: "/user",
    method: "put",
    onSuccess: ({ data }) => {
      toast.success(data.message);
    },
    onError: {
      title: "UPDATE_USER",
    },
  });

  return mutation;
};
