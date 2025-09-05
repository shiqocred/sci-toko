import { baseUrl } from "@/config";
import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Preview,
  render,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

interface VerifyEmailProps {
  name: string;
  code: string;
}

export const VerifyEmail = async ({ name, code }: VerifyEmailProps) => {
  return await render(
    <Html>
      <Head />
      <Tailwind>
        <Body className="mx-auto my-auto font-sans bg-gray-200">
          <Preview>
            Please validate your email address by clicking the button below.
            Once verified, you will be able to log in successfully.
          </Preview>
          <Container className="max-w-xl mx-auto">
            <Section className="max-w-xl w-full h-10" />
            <Section className="bg-white px-10 py-7 max-w-xl w-full mx-auto rounded-md">
              <Img
                src={`${baseUrl}/assets/images/logo-sci.png`}
                alt="Company Logo"
                width="120"
                className="mx-auto mb-4"
              />
              <Section>
                <Text className="text-sm text-center mb-1 mt-0">
                  Hi {name}! Thaks for signing up!
                </Text>
                <Text className="text-sm leading-relaxed text-center my-0">
                  Here&apos;s your one-time password (OTP) to verify your
                  account:
                </Text>
                <Text className="text-green-600 text-center text-4xl font-semibold tracking-wide my-4">
                  {code}
                </Text>
                <Text className="text-center my-0">
                  This code will expire in 15 minutes
                </Text>
                <Text className="text-center my-0">
                  Keep it to yourself, don&apos;t share it with anyone
                </Text>
              </Section>
              <Hr className="my-3" />
              <Section>
                <Text className="text-sm mt-0 mb-1 text-center">
                  This email was sent by Sehat Cerah Indonesia.
                </Text>
              </Section>
            </Section>
            <Section className="max-w-xl w-full h-10" />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};
