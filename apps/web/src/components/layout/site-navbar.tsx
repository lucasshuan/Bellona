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
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4 sm:px-10 lg:px-12">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-0.5">
            <div
              className="bg-primary shrink-0"
              style={{
                width: 22,
                height: 22,
                maskImage: `url(/icon.svg)`,
                WebkitMaskImage: `url(/icon.svg)`,
                maskSize: "contain",
                WebkitMaskSize: "contain",
                maskRepeat: "no-repeat",
                WebkitMaskRepeat: "no-repeat",
                maskPosition: "center",
                WebkitMaskPosition: "center",
              }}
              aria-label="Ares icon"
              role="img"
            />
            <p className="text-primary text-lg font-semibold -tracking-widest">
              Ares
            </p>
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
