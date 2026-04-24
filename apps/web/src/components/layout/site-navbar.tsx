import Image from "next/image";

import { Link } from "@/i18n/routing";

import { SignInButton } from "@/components/triggers/auth/sign-in-button";
import { UserMenu } from "@/components/layout/user-menu";
import { getTranslations } from "next-intl/server";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { NavLinks } from "@/components/layout/nav-links";
import { getServerAuthSession } from "@/auth";

export async function SiteNavbar() {
  const session = await getServerAuthSession();
  const t = await getTranslations("Navbar");

  return (
    <nav className="bg-background/80 sticky top-0 z-50 border-b border-white/6 backdrop-blur-xl">
      <div className="mx-auto flex w-full items-center justify-between px-6 py-4 sm:px-10 lg:px-12">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/logo.png"
              alt="Bellona"
              width={28}
              height={28}
              className="shrink-0"
            />
            <div className="flex flex-col leading-none">
              <span className="text-foreground font-display text-base font-semibold tracking-[0.2em] uppercase">
                Bellona
              </span>
              <span className="text-primary font-display mt-0.5 text-[8px] font-semibold tracking-[0.34em] uppercase">
                Tournament Platform
              </span>
            </div>
          </Link>

          <NavLinks />
        </div>

        <div className="flex items-center gap-3">
          <LocaleSwitcher />
          {session?.user ? (
            <UserMenu user={session.user} />
          ) : (
            <SignInButton
              size="sm"
              label={t("login")}
              callbackUrl="/"
              className="w-auto min-w-24"
            />
          )}
        </div>
      </div>
    </nav>
  );
}
