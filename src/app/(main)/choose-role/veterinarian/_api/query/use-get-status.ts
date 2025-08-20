import { useApiQuery } from "@/lib/query/use-query";

export type StatusUpgradeProps = {
  personalIdFile: string | null;
  veterinarianIdFile: string | null;
  role: "BASIC" | "PETSHOP" | "VETERINARIAN" | "ADMIN";
  status: "PENDING" | "REJECTED" | "APPROVED" | null;
  message: string | null;
  personalId: string | null;
  veterinarianId: string | null;
  fullName: string | null;
};

type Response = {
  data: StatusUpgradeProps;
};

export const useGetStatusRoleVeterinarian = () => {
  const query = useApiQuery<Response>({
    key: ["status-app-veterinarian"],
    endpoint: `/upgrade-role?role=veterinarian`,
  });
  return query;
};
