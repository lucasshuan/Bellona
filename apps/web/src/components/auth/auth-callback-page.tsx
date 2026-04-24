"use client";

import { Suspense, useCallback, useEffect, useRef } from "react";
import { signIn } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";

import Image from "next/image";

import { type AppLocale, getLocalizedPathname } from "@/i18n/locale";
import { getApiUrl } from "@/lib/api";

// Module-level set survives React StrictMode's double-mount in development,
// ensuring each auth code is exchanged exactly once.
const processedCodes = new Set<string>();

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale() as AppLocale;
  const processing = useRef(false);

  const redirectWithLocale = useCallback(
    (href: string | { pathname: string; query?: Record<string, string> }) => {
      router.replace(getLocalizedPathname(href, locale));
    },
    [router, locale],
  );

  useEffect(() => {
    const code = searchParams.get("code");

    if (!code) {
      console.error("[AuthCallback] No code found in search params");
      redirectWithLocale({
        pathname: "/",
        query: { error: "Callback" },
      });
      return;
    }

    if (processing.current) return;
    if (processedCodes.has(code)) return;
    processing.current = true;
    processedCodes.add(code);

    console.log("[AuthCallback] Starting code exchange...", { code });

    void (async () => {
      try {
        const response = await fetch(getApiUrl("/auth/exchange"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code }),
        });

        if (!response.ok) {
          const errorData = (await response.json().catch(() => ({}))) as Record<
            string,
            unknown
          >;
          console.error("[AuthCallback] Exchange failed", {
            status: response.status,
            errorData,
          });
          redirectWithLocale({
            pathname: "/",
            query: { error: "Callback" },
          });
          return;
        }

        const { token } = (await response.json()) as { token: string };
        console.log("[AuthCallback] Exchange successful, signing in...");

        const result = await signIn("credentials", {
          token,
          redirect: false,
        });

        if (result?.ok) {
          console.log(
            "[AuthCallback] Sign in successful, redirecting to /profile",
          );
          router.refresh();
          redirectWithLocale("/profile");
          return;
        }

        console.error("[AuthCallback] Sign in failed", result?.error);
        redirectWithLocale({
          pathname: "/",
          query: { error: "Callback" },
        });
      } catch (error) {
        console.error(
          "[AuthCallback] Unexpected error",
          error instanceof Error ? error.message : error,
        );
        redirectWithLocale({
          pathname: "/",
          query: { error: "Callback" },
        });
      }
    })();
  }, [redirectWithLocale, router, searchParams]);

  const t = useTranslations("Auth.Callback");

  return (
    <div className="bg-background fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden">
      {/* Ambient glows */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <div className="bg-primary/8 absolute -top-24 left-1/2 h-120 w-170 -translate-x-1/2 rounded-full blur-[140px]" />
        <div className="bg-primary-strong/6 absolute -bottom-32 right-1/4 h-80 w-120 rounded-full blur-[120px]" />
      </div>

      {/* Content */}
      <div className="relative flex flex-col items-center gap-8">
        {/* Ares logo mark */}
        <div className="relative">
          <div className="bg-primary/20 absolute -inset-8 animate-pulse rounded-full blur-2xl" />
          <Image src="/logo.png" alt="Bellona" width={40} height={40} className="relative size-10 object-contain" />
        </div>

        {/* Spinner ring */}
        <div className="relative flex items-center justify-center">
          <div className="border-primary/20 absolute size-16 rounded-full border-2" />
          <div className="border-primary size-16 animate-spin rounded-full border-2 border-t-transparent" />
          <div className="bg-primary/60 absolute size-2 rounded-full" />
        </div>

        {/* Text */}
        <div className="flex flex-col items-center gap-2">
          <p className="text-foreground/80 text-lg font-medium tracking-wide">
            {t("title")}
          </p>
          <p className="text-muted text-sm">
            {t("subtitle")}
          </p>
        </div>

        {/* Animated dots */}
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="bg-primary/50 size-1.5 animate-bounce rounded-full"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function AuthCallbackPage() {
  return (
    <Suspense fallback={null}>
      <AuthCallbackContent />
    </Suspense>
  );
}
