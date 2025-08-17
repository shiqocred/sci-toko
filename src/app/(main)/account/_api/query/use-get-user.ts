import { useApiQuery } from "@/lib/query/use-query";

export type UserProps = {
  image: string | null;
  email: string | null;
  emailVerified: string | null;
  name: string;
  phoneNumber: string;
  role: "BASIC" | "PETSHOP" | "VETERINARIAN" | "ADMIN";
  newRole: "BASIC" | "PETSHOP" | "VETERINARIAN" | "ADMIN";
  statusRole: "PENDING" | "REJECTED" | "APPROVED" | null;
};

type Response = {
  data: UserProps;
};

export const useGetUser = () => {
  const query = useApiQuery<Response>({
    key: ["user"],
    endpoint: `/user`,
  });
  return query;
};
