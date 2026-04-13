import type { Route } from "next";
import Link from "next/link";
import { ChevronRight, Compass } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

import { SignInButton } from "@/components/auth/sign-in-button";
import { LoginErrorHandler } from "@/components/auth/login-error-handler";
import { getPublicGames } from "@/server/db/queries/public";
import { SectionHeader } from "@/components/ui/section-header";
import { cn } from "@/lib/utils";
import { GameCard, GameCardSkeleton } from "@/components/brand/game-card";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const t = await getTranslations("HomePage");
  const { games: gameList, isDatabaseUnavailable } = await getPublicGames({
    limit: 4,
    orderBy: "popular",
  });
  const showFallbackCard = isDatabaseUnavailable || gameList.length === 0;

  return (
    <main className="grid-surface">
      <LoginErrorHandler />
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-6 py-12 sm:px-10 lg:px-12 lg:py-16">
        <section className="relative flex flex-col items-center space-y-4 text-center">
          <div className="pointer-events-none absolute top-1/2 left-1/2 -z-10 aspect-square w-[500px] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(circle,color-mix(in_srgb,var(--primary)_8%,transparent)_0%,transparent_70%)] sm:w-[800px]" />
          <h1 className="text-primary flex items-center justify-center gap-4 text-5xl font-semibold tracking-[-0.06em] sm:gap-6 sm:text-6xl lg:text-7xl">
            <div
              className="bg-primary size-12 shrink-0 sm:size-14 lg:size-20"
              style={{
                maskImage: `url(/icon.svg)`,
                WebkitMaskImage: `url(/icon.svg)`,
                maskSize: "contain",
                WebkitMaskSize: "contain",
                maskRepeat: "no-repeat",
                WebkitMaskRepeat: "no-repeat",
                maskPosition: "center",
                WebkitMaskPosition: "center",
              }}
              aria-label="Enyo icon"
              role="img"
            />
            Enyo
          </h1>
          <p className="text-muted max-w-2xl text-base leading-8 sm:text-lg">
            {t("heroSubtitle")}
          </p>
          <div className="flex gap-3 pt-4 sm:gap-4">
            <Link
              href="/games"
              className={cn(
                buttonVariants({ intent: "secondary", size: "lg" }),
                "px-8 text-sm sm:text-base",
              )}
            >
              <Compass className="mr-2 size-5" />
              {t("explore")}
            </Link>
            <SignInButton
              size="lg"
              label={t("join")}
              className="text-sm sm:text-base"
            />
          </div>
        </section>

        <section id="games" className="space-y-6">
          <SectionHeader
            title={t("games.title")}
            description={t("games.description")}
          />

          {!showFallbackCard ? (
            <div className="space-y-8">
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {gameList.map((game) => (
                  <GameCard
                    key={game.id}
                    game={game}
                    fallbackDescription={t("games.cardFallbackDescription")}
                  />
                ))}
              </div>

              <div className="flex justify-center">
                <Link
                  href="/games"
                  className={cn(
                    buttonVariants({ intent: "secondary", size: "lg" }),
                    "group rounded-full border-white/10 px-12 transition-all duration-300 hover:border-white/25",
                  )}
                >
                  {t("games.viewAll")}
                  <ChevronRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <GameCardSkeleton
                title={t("games.noGamesTitle")}
                description={t("games.noGamesDescription")}
              />
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
