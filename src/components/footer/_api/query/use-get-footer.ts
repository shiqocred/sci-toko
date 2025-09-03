import { useApiQuery } from "@/lib/query/use-query";

type Response = {
  data: {
    sosmed: {
      facebook: string;
      linkedin: string;
      instagram: string;
    };
    store: {
      name: string;
      address: string;
    };
  };
};

export const useGetFooter = () => {
  const query = useApiQuery<Response>({
    key: ["footer"],
    endpoint: `/homepage/footer`,
  });
  return query;
};
