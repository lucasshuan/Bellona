import type { Metadata } from "next";

import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteNavbar } from "@/components/layout/site-navbar";
import { routing } from "@/i18n/routing";

import { Providers } from "@/components/providers";

import "./globals.css";
import "flag-icons/css/flag-icons.min.css";

export const metadata: Metadata = {
  title: {
    default: "Ares",
    template: "%s | Ares",
  },
  description:
    "Base inicial do Ares: plataforma de ranking e torneios para jogos com Next.js, Auth.js e Drizzle.",
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <div className="app-scroll-shell relative h-screen">
              <div className="grid-surface pointer-events-none fixed inset-0 -z-50" />
              <SiteNavbar />
              <div className="min-h-[calc(100vh-137px)]">{children}</div>
              <SiteFooter />
            </div>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
