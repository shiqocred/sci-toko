import { useApiQuery } from "@/lib/query/use-query";

type Ongkir = {
  id: string;
  name: "EXPRESS" | "REGULAR" | "ECONOMY";
  company: string;
  price: string;
  duration: string;
  type: string;
};

type Response = {
  data: {
    express: Ongkir | null;
    regular: Ongkir | null;
    economy: Ongkir | null;
  };
};

export const useGetOngkir = () => {
  const query = useApiQuery<Response>({
    key: ["ongkir"],
    endpoint: `/checkout/couriers`,
  });
  return query;
};
