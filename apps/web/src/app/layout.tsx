import type { Metadata } from "next";

import { getLocale } from "next-intl/server";

import { routing } from "@/i18n/routing";

import "./[locale]/globals.css";
import "flag-icons/css/flag-icons.min.css";

export const metadata: Metadata = {
  title: {
    default: "Ares",
    template: "%s | Ares",
  },
  description:
    "Base inicial do Ares: plataforma de ranking e torneios para jogos com Next.js, Auth.js e Drizzle.",
};

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale().catch(() => routing.defaultLocale);

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
