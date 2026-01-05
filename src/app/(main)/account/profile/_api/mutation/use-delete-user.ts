import { useMutate } from "@/lib/query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const useDeleteUser = () => {
  const router = useRouter();
  const mutation = useMutate({
    endpoint: "/user",
    method: "delete",
    onSuccess: async ({ data }) => {
      toast.success(data.message);
      router.push("/sign-in");
    },
    onError: {
      title: "DELETE_USER",
    },
  });

  return mutation;
};
