import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Enyo",
    template: "%s | Enyo",
  },
  description:
    "Base inicial do Enyo: plataforma de ranking e torneios para jogos com Next.js, Auth.js e Drizzle.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
