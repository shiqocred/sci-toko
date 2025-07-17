import { useApiQuery } from "@/lib/query/use-query";

type Response = {
  data: {
    status: "PENDING" | "APPROVED" | "REJECTED" | null;
    role: "BASIC" | "PETSHOP" | "VETERINARIAN";
    message: string | null;
  };
};

export const useGetStatusRoleVeterinarian = () => {
  const query = useApiQuery<Response>({
    key: ["status-app-veterinarian"],
    endpoint: `/upgrade-role?role=veterinarian`,
  });
  return query;
};
