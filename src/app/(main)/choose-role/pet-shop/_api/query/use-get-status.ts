import { useApiQuery } from "@/lib/query/use-query";

type Response = {
  data: {
    status: "PENDING" | "APPROVED" | "REJECTED" | null;
    name: string | null;
    role: "BASIC" | "PETSHOP" | "VETERINARIAN" | "ADMIN";
    message: string | null;
    fileKtp: string | null;
    storefront: string | null;
    nik: string | null;
  };
};

export const useGetStatusRolePetshop = () => {
  const query = useApiQuery<Response>({
    key: ["status-app-petshop"],
    endpoint: `/upgrade-role?role=petshop`,
  });
  return query;
};
