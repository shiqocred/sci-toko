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

interface PaymentSuccessProps {
  name: string;
  code: string;
}

export const PaymentSuccess = ({ name, code }: PaymentSuccessProps) => (
  <Html>
    <Tailwind>
      <Head />
      <Body className="bg-gray-100 font-sans px-4 py-6">
        <Preview>Your payment was successful — Order #123456</Preview>
        <Container className="bg-white rounded-xl p-6 shadow-sm max-w-lg mx-auto">
          <Section className="text-center mb-6">
            <Img
              src={"https://dummyimage.com/squarepopup"}
              alt="Company Logo"
              width="120"
              className="mx-auto mb-4"
            />
            <Text className="text-xl font-semibold text-gray-900">
              Payment Successful!
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
            <Text className="text-sm text-gray-600">
              <strong>Order Number:</strong> #123456
            </Text>
            <Text className="text-sm text-gray-600">
              <strong>Order Date:</strong>{" "}
              {format(new Date(), "PPP", { locale: id })}
            </Text>
            <Text className="text-sm text-gray-600">
              <strong>Total Paid:</strong> {formatRupiah(200000)}
            </Text>
          </Section>

          <Text className="text-base text-gray-700 mb-4">
            You can track your order status and manage it from your dashboard.
          </Text>

          <Section className="text-center">
            <Button
              href={"http://localhost:3000/account"}
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

PaymentSuccess.PreviewProps = {
  name: "Alan",
  code: "877777",
} as PaymentSuccessProps;

export default PaymentSuccess;
