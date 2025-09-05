import { baseUrl } from "@/config";
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

interface PaymentFailedProps {
  name: string;
  company: string;
  orderId: string;
}

export const PaymentFailed = async ({
  name,
  company,
  orderId,
}: PaymentFailedProps) => {
  return await render(
    <Html>
      <Tailwind>
        <Head />
        <Body className="bg-gray-100 font-sans px-4 py-6">
          <Preview>Payment failed for Order #{orderId}</Preview>
          <Container className="bg-white rounded-xl p-6 shadow-sm max-w-lg mx-auto">
            <Section className="text-center mb-6">
              <Img
                src={`${baseUrl}/assets/images/logo-sci.png`}
                alt="Company Logo"
                width="120"
                className="mx-auto mb-4"
              />
              <Text className="text-xl font-semibold text-gray-900">
                Payment Failed
              </Text>
            </Section>

            <Text className="text-base text-gray-700 mb-4">
              Hi <strong>{name}</strong>,
            </Text>
            <Text className="text-base text-gray-700 mb-4">
              Thank you for your order at <strong>{company}</strong>.
              Unfortunately, your payment attempt did not go through.
            </Text>

            <Section className="border border-gray-200 rounded-lg p-4 my-6">
              <Text className="text-base text-gray-700 mb-4">
                The payment for <strong>Order #{orderId}</strong> could not be
                completed. This might be due to a timeout.
              </Text>
              <Text className="text-base text-gray-700 mb-4">
                Your order has been cancelled.
              </Text>
            </Section>

            <Section className="text-center">
              <Button
                href={`${baseUrl}/account/orders`}
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
};
