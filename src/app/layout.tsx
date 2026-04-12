import type { Metadata } from "next";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Enyo",
    template: "%s | Enyo",
  },
  description:
    "Base inicial do Enyo: plataforma de ranking e torneios para jogos com Next.js, Auth.js e Drizzle.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <div className="min-h-screen">
          <SiteHeader />
          <div className="min-h-[calc(100vh-137px)]">{children}</div>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
