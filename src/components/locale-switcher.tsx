"use client";

import { useRef } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("LocaleSwitcher");
  const menuRef = useRef<HTMLDivElement>(null);

  const switchLocale = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  const flags: Record<string, string> = {
    en: "fi-us",
    pt: "fi-br",
  };

  return (
    <div className="group relative z-50" ref={menuRef}>
      <button
        className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-white/10"
        aria-label={t("label")}
      >
        <span className={`fi ${flags[locale]} w-5 h-3.5 rounded-sm transition-opacity opacity-80 group-hover:opacity-100`} />
      </button>

      <div className="invisible absolute right-0 top-full pt-2 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
        <div className="flex flex-col overflow-hidden w-48 rounded-xl border border-white/10 bg-[#0a0a0a] shadow-xl">
          <div className="px-4 py-3 text-sm font-semibold text-white/70 border-b border-white/10">
            {t("label")}
          </div>
          <div className="flex flex-col gap-0.5 p-1.5">
            {Object.entries(flags).map(([key, flagClass]) => (
              <button
                key={key}
                onClick={() => switchLocale(key)}
                className={`flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-white/10 ${
                  locale === key ? "bg-white/10 text-white" : "text-white/80"
                }`}
              >
                <span className={`fi ${flagClass} w-5 h-3.5 rounded-sm flex-shrink-0`} />
                <span>{t(key)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
