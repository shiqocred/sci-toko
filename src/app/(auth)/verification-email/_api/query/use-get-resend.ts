import { useApiQuery } from "@/lib/query/use-query";

type Response = {
  data: {
    resend: string | null;
  };
};

export const useGetResend = () => {
  const query = useApiQuery<Response>({
    key: ["resend-otp"],
    endpoint: `/auth/verify/otp`,
  });
  return query;
};
