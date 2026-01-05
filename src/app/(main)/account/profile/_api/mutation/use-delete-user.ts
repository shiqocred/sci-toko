import { useMutate } from "@/lib/query";
import { signOut } from "next-auth/react";
import { toast } from "sonner";

export const useDeleteUser = () => {
  const mutation = useMutate<undefined, undefined, { email: string }>({
    endpoint: "/user",
    method: "delete",
    onSuccess: async ({ data }) => {
      toast.success(data.message);
      await signOut({ redirect: true, redirectTo: "/" });
    },
    onError: {
      title: "DELETE_USER",
    },
  });

  return mutation;
};
