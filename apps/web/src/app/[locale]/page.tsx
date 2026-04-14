import { Link } from "@/i18n/routing";
import { Suspense } from "react";
import { ChevronRight, Compass } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

import { SignInButton } from "@/components/triggers/auth/sign-in-button";
import { LoginErrorHandler } from "@/components/auth/login-error-handler";
import { SectionHeader } from "@/components/ui/section-header";
import { cn } from "@/lib/utils";
import { GameCard, GameCardSkeleton } from "@/components/cards/game-card";
import { getTranslations } from "next-intl/server";
import { getClient } from "@/lib/apollo/apollo-client";
import { GET_GAMES } from "@/lib/apollo/queries/games";
import { Game } from "@/lib/apollo/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const t = await getTranslations("HomePage");

  return (
    <main className="relative overflow-hidden">
      {/* Background Glows */}
      <div className="pointer-events-none absolute -top-24 -left-24 -z-10 aspect-square w-150 rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--primary)_15%,transparent)_0%,transparent_70%)] opacity-60 blur-[80px]" />
      <div className="pointer-events-none absolute -top-24 -right-24 -z-10 aspect-square w-120 rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--primary)_8%,transparent)_0%,transparent_70%)] opacity-40 blur-[60px]" />

      <LoginErrorHandler />
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-6 pt-16 pb-12 sm:px-10 lg:px-12 lg:pt-24 lg:pb-16">
        <section className="relative flex flex-col items-center space-y-4 text-center">
          <div className="pointer-events-none absolute top-1/2 left-1/2 -z-10 aspect-square w-125 -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(circle,color-mix(in_srgb,var(--primary)_8%,transparent)_0%,transparent_70%)] sm:w-200" />
          <h1 className="text-primary flex items-center justify-center gap-0! text-8xl! font-semibold tracking-[-0.06em] sm:gap-6 sm:text-6xl lg:text-7xl">
            <div
              className="bg-primary size-16 shrink-0 sm:size-20 lg:size-28"
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
              aria-label="Ares icon"
              role="img"
            />
            Ares
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

          <Suspense
            fallback={
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <GameCardSkeleton />
                <GameCardSkeleton />
                <GameCardSkeleton />
                <GameCardSkeleton />
              </div>
            }
          >
            <PublicGamesList
              fallbackDescription={t("games.cardFallbackDescription")}
              noGamesTitle={t("games.noGamesTitle")}
              noGamesDescription={t("games.noGamesDescription")}
            />
          </Suspense>

          <div className="flex justify-center pt-2">
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
        </section>
      </div>
    </main>
  );
}

interface PublicGamesListProps {
  fallbackDescription: string;
  noGamesTitle: string;
  noGamesDescription: string;
}

async function PublicGamesList({
  fallbackDescription,
  noGamesTitle,
  noGamesDescription,
}: PublicGamesListProps) {
  const { data } = await getClient().query<{ games: Game[] }>({
    query: GET_GAMES,
  });

  const games = data?.games || [];
  const gameList = games.slice(0, 4).map((game) => ({
    ...game,
    rankingCount: game._count?.events || 0,
    playerCount: game._count?.players || 0,
    tourneyCount: 0,
    postCount: 0,
  }));

  if (gameList.length === 0) {
    return (
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <GameCardSkeleton
          title={noGamesTitle}
          description={noGamesDescription}
        />
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {gameList.map((game) => (
        <GameCard
          key={game.id}
          game={game}
          fallbackDescription={fallbackDescription}
        />
      ))}
    </div>
  );
}
