import { useApiQuery } from "@/lib/query/use-query";

type Response = {
  data: {
    status: "PENDING" | "APPROVED" | "REJECTED" | null;
    role: "BASIC" | "PETSHOP" | "VETERINARIAN";
    message: string | null;
  };
};

export const useGetStatusRolePetshop = () => {
  const query = useApiQuery<Response>({
    key: ["status-app-petshop"],
    endpoint: `/upgrade-role?role=petshop`,
  });
  return query;
};
