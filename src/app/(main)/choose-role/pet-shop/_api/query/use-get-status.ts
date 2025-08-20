import { useApiQuery } from "@/lib/query/use-query";

export type StatusUpgradeProps = {
  role: "BASIC" | "PETSHOP" | "VETERINARIAN" | "ADMIN";
  status: "PENDING" | "REJECTED" | "APPROVED" | null;
  message: string | null;
  personalIdType: "NIK" | "NIB" | "NPWP" | null;
  personalIdFile: string | null;
  storefrontFile: string | null;
  personalId: string | null;
  fullName: string | null;
};

type Response = {
  data: StatusUpgradeProps;
};

export const useGetStatusRolePetshop = () => {
  const query = useApiQuery<Response>({
    key: ["status-app-petshop"],
    endpoint: `/upgrade-role?role=petshop`,
  });
  return query;
};
