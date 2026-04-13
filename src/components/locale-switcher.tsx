"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Check, ChevronDown } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { routing, usePathname, useRouter } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const flags: Record<(typeof routing.locales)[number], string> = {
  en: "fi-us",
  pt: "fi-br",
};

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("LocaleSwitcher");
  const [selectedLocale, setSelectedLocale] = useState(locale);
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedLocale(locale);
  }, [locale]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  useEffect(() => {
    for (const targetLocale of routing.locales) {
      if (targetLocale !== locale) {
        router.prefetch(pathname, { locale: targetLocale });
      }
    }
  }, [locale, pathname, router]);

  const switchLocale = (newLocale: (typeof routing.locales)[number]) => {
    if (newLocale === locale) {
      setIsOpen(false);
      return;
    }

    setSelectedLocale(newLocale);
    setIsOpen(false);

    startTransition(() => {
      router.replace(pathname, { locale: newLocale, scroll: false });
    });
  };

  return (
    <div className="relative" ref={containerRef}>
      <span className="sr-only">{t("label")}</span>

      <button
        type="button"
        aria-label={t("label")}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        disabled={isPending}
        onClick={() => setIsOpen((current) => !current)}
        className="focus:border-primary/50 focus:ring-primary/10 flex h-11 min-w-44 items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 text-left text-sm font-medium text-white outline-hidden transition-all hover:bg-white/[0.07] focus:bg-white/[0.07] focus:ring-4 disabled:cursor-wait disabled:opacity-80"
      >
        <span className="flex size-5 shrink-0 items-center justify-center overflow-hidden rounded-sm">
          <span
            className={cn(
              "fi h-full w-full object-cover",
              flags[selectedLocale as keyof typeof flags],
              isPending ? "opacity-60" : "opacity-90",
            )}
          />
        </span>
        <span className="flex-1 truncate">{t(selectedLocale)}</span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-white/45 transition-all",
            isOpen && "rotate-180",
            isPending && "text-primary animate-pulse",
          )}
        />
      </button>

      {isOpen && (
        <div className="glass-panel absolute top-full right-0 z-50 mt-2 min-w-full overflow-hidden rounded-2xl border border-white/10 bg-[#0f0b12]/95 p-1 shadow-2xl backdrop-blur-xl">
          <div
            role="listbox"
            aria-label={t("label")}
            className="flex flex-col gap-1"
          >
            {routing.locales.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => switchLocale(value)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors hover:bg-white/10",
                  selectedLocale === value && "bg-white/8",
                )}
              >
                <span className="flex size-5 shrink-0 items-center justify-center overflow-hidden rounded-sm">
                  <span
                    className={cn(
                      "fi h-full w-full object-cover",
                      flags[value],
                    )}
                  />
                </span>
                <span className="flex-1 truncate font-medium text-white">
                  {t(value)}
                </span>
                {selectedLocale === value && (
                  <Check className="text-primary size-4 shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
