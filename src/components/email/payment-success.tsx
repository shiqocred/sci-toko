import { baseUrl } from "@/config";
import { formatRupiah } from "@/lib/utils";
import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Img,
  Preview,
  render,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface PaymentSuccessProps {
  name: string;
  company: string;
  orderId: string;
  paidAt: string;
  total: string;
}

export const PaymentSuccess = async ({
  name,
  company,
  orderId,
  paidAt,
  total,
}: PaymentSuccessProps) => {
  return await render(
    <Html>
      <Tailwind>
        <Head />
        <Body className="bg-gray-100 font-sans px-4 py-6">
          <Preview>Payment success for Order #{orderId}</Preview>
          <Container className="bg-white rounded-xl p-6 shadow-sm max-w-lg mx-auto">
            <Section className="text-center mb-6">
              <Img
                src={`${baseUrl}/assets/images/logo-sci.png`}
                alt="Company Logo"
                width="120"
                className="mx-auto mb-4"
              />
              <Text className="text-xl font-semibold text-gray-900">
                Payment Successful!
              </Text>
            </Section>

            <Text className="text-base text-gray-700 mb-4">
              Hi <strong>{name}</strong>,
            </Text>
            <Text className="text-base text-gray-700 mb-4">
              Thank you for your order at <strong>{company}</strong>! Your
              payment has been received and we&apos;re now processing your
              order.
            </Text>

            <Section className="border border-gray-200 rounded-lg p-4 my-6">
              <Text className="text-sm text-gray-600">
                <strong>Order Number:</strong> #{orderId}
              </Text>
              <Text className="text-sm text-gray-600">
                <strong>Paid at:</strong>{" "}
                {format(new Date(paidAt), "PPP", { locale: id })}
              </Text>
              <Text className="text-sm text-gray-600">
                <strong>Total Paid:</strong> {formatRupiah(total)}
              </Text>
            </Section>

            <Text className="text-base text-gray-700 mb-4">
              You can track your order status from your dashboard.
            </Text>

            <Section className="text-center">
              <Button
                href={`${baseUrl}/account/orders?tab=processed`}
                className="bg-red-500 text-white text-sm font-medium py-3 px-6 rounded-md hover:bg-red-600"
              >
                View My Orders
              </Button>
            </Section>

            <Text className="text-sm text-gray-500 mt-6">
              If you need any help, feel free to contact our support team.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};
