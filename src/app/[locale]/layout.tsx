import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css";
import { notFound } from "next/navigation";
import { getMessages } from "next-intl/server";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { routing } from "@/i18n/routing";
import { QueryProvider } from "@/providers/QueryProvider";
import { Toaster } from "sonner";
import { Header } from "@/components/navigation/header";
import Footer from "@/components/navigation/footer";
import TopLoader from "@/components/shared/top-loader";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fleur Garden",
  description: "Fleur Garden",
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const messages = (await getMessages()) as Record<string, string>;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <html lang={locale}>
      <body className={`${inter.variable}`}>
        <QueryProvider>
          <NextIntlClientProvider messages={messages}>
            <main className="md:pt-36 pt-20">
              <Header />
              {children}
              <Footer />
            </main>
            <TopLoader />
            <Toaster position="top-center" richColors />
          </NextIntlClientProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
