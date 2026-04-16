import type { Metadata } from "next";

import { getLocale } from "next-intl/server";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { env } from "@/env";
import { routing } from "@/i18n/routing";

import "./[locale]/globals.css";
import "flag-icons/css/flag-icons.min.css";

const metadataBaseUrl =
  env.NEXTAUTH_URL ??
  env.NEXT_PUBLIC_APP_URL ??
  (env.NODE_ENV === "development" ? "http://localhost:3000" : null);

if (!metadataBaseUrl) {
  throw new Error(
    "Missing site URL environment variable. Set NEXTAUTH_URL or NEXT_PUBLIC_APP_URL.",
  );
}

export const metadata: Metadata = {
  metadataBase: new URL(metadataBaseUrl),
  title: {
    default: "Ares",
    template: "%s | Ares",
  },
  description: "Plataforma de league e torneios para jogos.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "Ares",
    description: "Plataforma de league e torneios para jogos.",
    images: [
      {
        url: "/logo.png",
        alt: "Ares",
        width: 120,
        height: 120,
        type: "image/png",
      },
    ],
  },
};

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale().catch(() => routing.defaultLocale);

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
