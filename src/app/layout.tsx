import { SessionProvider } from "next-auth/react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import QueryProviders from "@/providers/query-provider";
import { ToastProvider } from "@/providers/toast-provider";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { ThemeProvider } from "@/providers/theme-provider";
import { auth } from "@/lib/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | Sehat Cerah Indonesia",
    default: "Sehat Cerah Indonesia",
  },
  description:
    "PT Sehat Cerah Indonesia (SCI) - for the health of Indonesia's livestock, is a company engaged in the field of importers and distributors of animal medicines, provides various solutions for farmers and feed mills including feed additive products and farm products, Farm Products",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider session={session}>
          <QueryProviders>
            <NuqsAdapter>
              <ThemeProvider
                attribute="class"
                defaultTheme="light"
                enableSystem={false}
                disableTransitionOnChange
              >
                <ToastProvider />
                {children}
              </ThemeProvider>
            </NuqsAdapter>
          </QueryProviders>
        </SessionProvider>
      </body>
    </html>
  );
}
