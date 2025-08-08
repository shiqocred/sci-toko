import { baseUrl } from "@/config";
import { formatRupiah } from "@/lib/utils";
import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface PaymentFailedProps {
  name: string;
  code: string;
}

export const PaymentFailed = ({ name, code }: PaymentFailedProps) => (
  <Html>
    <Tailwind>
      <Head />
      <Body className="bg-gray-100 font-sans px-4 py-6">
        <Preview>Payment failed for Order #123456</Preview>
        <Container className="bg-white rounded-xl p-6 shadow-sm max-w-lg mx-auto">
          <Section className="text-center mb-6">
            <Img
              src={"https://dummyimage.com/squarepopup"}
              alt="Company Logo"
              width="120"
              className="mx-auto mb-4"
            />
            <Text className="text-xl font-semibold text-gray-900">
              Payment Failed
            </Text>
          </Section>

          <Text className="text-base text-gray-700 mb-4">
            Hi <strong>Fulan</strong>,
          </Text>
          <Text className="text-base text-gray-700 mb-4">
            Thank you for your order at <strong>[Your Company Name]</strong>!
            Your payment has been received and we&apos;re now processing your
            order.
          </Text>

          <Section className="border border-gray-200 rounded-lg p-4 my-6">
            <Text className="text-base text-gray-700 mb-4">
              Unfortunately, your payment for <strong>Order #123456</strong>{" "}
              wasn&apos;t successful. This could be due to a timeout,
              insufficient funds, or a technical issue.
            </Text>
            <Text className="text-base text-gray-700 mb-4">
              You can retry your payment now to avoid cancellation.
            </Text>
          </Section>

          <Section className="text-center">
            <Button
              href={"http://localhost:3000/account"}
              className="bg-red-500 text-white text-sm font-medium py-3 px-6 rounded-md hover:bg-red-600"
            >
              View My Orders
            </Button>
          </Section>

          <Text className="text-sm text-gray-500 mt-6">
            Need assistance? Our support team is here to help.
          </Text>
        </Container>
      </Body>
    </Tailwind>
  </Html>
);

PaymentFailed.PreviewProps = {
  name: "Alan",
  code: "877777",
} as PaymentFailedProps;

export default PaymentFailed;
