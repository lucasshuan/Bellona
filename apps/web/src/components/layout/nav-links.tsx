"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const links = [
  { href: "/games", labelKey: "games" as const },
  { href: "/events", labelKey: "events" as const },
];

export function NavLinks() {
  const t = useTranslations("Navbar");
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-1 sm:flex">
      {links.map(({ href, labelKey }) => {
        const isActive = pathname === href || pathname.startsWith(`${href}/`);

        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "relative px-3 py-1.5 text-sm font-medium transition-colors duration-150",
              "rounded-lg",
              isActive
                ? "text-primary bg-primary/10"
                : "text-white/50 hover:bg-white/5 hover:text-white",
            )}
          >
            {t(labelKey)}
            {isActive && (
              <span className="bg-primary absolute right-2 bottom-0.5 left-2 h-px rounded-full opacity-60" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
