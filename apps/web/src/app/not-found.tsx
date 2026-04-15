import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteNavbar } from "@/components/layout/site-navbar";
import { Providers } from "@/components/providers";
import { NotFoundPage } from "@/components/errors/not-found-page";
import { ApolloWrapper } from "@/lib/apollo/apollo-provider";

export default async function GlobalNotFoundPage() {
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <ApolloWrapper>
        <Providers>
          <div className="app-scroll-shell relative h-screen">
            <div className="grid-surface pointer-events-none fixed inset-0 -z-50" />
            <SiteNavbar />
            <div className="min-h-[calc(100vh-137px)]">
              <NotFoundPage />
            </div>
            <SiteFooter />
          </div>
        </Providers>
      </ApolloWrapper>
    </NextIntlClientProvider>
  );
}
