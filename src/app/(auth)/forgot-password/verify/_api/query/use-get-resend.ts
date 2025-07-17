import { useApiQuery } from "@/lib/query/use-query";

type Response = {
  data: {
    resend: string | null;
  };
};

export const useGetResend = ({ email }: { email: string }) => {
  const query = useApiQuery<Response>({
    key: ["resend-forgot-password-otp"],
    endpoint: `/auth/forgot-password/otp?email=${encodeURIComponent(email)}`,
  });
  return query;
};
