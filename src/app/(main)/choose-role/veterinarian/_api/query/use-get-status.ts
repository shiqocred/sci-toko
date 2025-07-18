import { useApiQuery } from "@/lib/query/use-query";

type Response = {
  data: {
    fileKtp: string | null;
    fileKta: string | null;
    message: string | null;
    name: string | null;
    role: "BASIC" | "PETSHOP" | "VETERINARIAN" | "ADMIN";
    status: "PENDING" | "APPROVED" | "REJECTED" | null;
    nik: string | null;
    noKta: string | null;
  };
};

export const useGetStatusRoleVeterinarian = () => {
  const query = useApiQuery<Response>({
    key: ["status-app-veterinarian"],
    endpoint: `/upgrade-role?role=veterinarian`,
  });
  return query;
};
