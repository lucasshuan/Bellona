import { Link } from "@/i18n/routing";
import { Trophy } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { GET_GAMES } from "@/lib/apollo/queries/games";
import { GetGamesQuery } from "@/lib/apollo/generated/graphql";
import { GameCard, GameCardSkeleton } from "@/components/cards/game-card";
import { SearchInput } from "@/components/ui/search-input";
import { SectionHeader } from "@/components/ui/section-header";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Suspense } from "react";
import { safeServerQuery } from "@/lib/apollo/safe-server-query";

interface GamesPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ search?: string; sort?: string }>;
}

export const dynamic = "force-dynamic";

export default async function GamesPage({ searchParams }: GamesPageProps) {
  const { search, sort } = await searchParams;
  const t = await getTranslations("GamesPage");

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 pt-14 pb-12 sm:px-10 lg:px-12">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-col gap-6">
          <SectionHeader title={t("title")} description={t("description")} />
        </div>

        <div className="flex w-full flex-col gap-4 lg:max-w-md lg:items-end">
          <SearchInput
            defaultValue={search}
            placeholder={t("searchPlaceholder")}
            className="w-full"
          />

          <div className="flex flex-wrap items-center gap-3 lg:justify-end">
            <Link
              href={
                sort !== "name"
                  ? "#"
                  : `?${new URLSearchParams({ ...(search ? { search } : {}), sort: "popular" })}`
              }
              className={cn(
                "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300",
                sort !== "name"
                  ? "bg-primary/20 text-primary border-primary/20 border shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)]"
                  : "border border-white/5 text-white/40 hover:border-white/10 hover:text-white/60",
              )}
            >
              <Trophy className="size-4" />
              {t("sortPopular")}
            </Link>
            <Link
              href={
                sort === "name"
                  ? "#"
                  : `?${new URLSearchParams({ ...(search ? { search } : {}), sort: "name" })}`
              }
              className={cn(
                "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300",
                sort === "name"
                  ? "bg-primary/20 text-primary border-primary/20 border shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)]"
                  : "border border-white/5 text-white/40 hover:border-white/10 hover:text-white/60",
              )}
            >
              {t("sortAlphabetical")}
            </Link>
          </div>
        </div>
      </div>
      <div className="border-b border-white/5" />

      <Suspense key={`${search}-${sort}`} fallback={<GamesGridSkeleton />}>
        <GamesGrid search={search} />
      </Suspense>
    </main>
  );
}

function GamesGridSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <GameCardSkeleton key={i} />
      ))}
    </div>
  );
}

async function GamesGrid({ search }: { search?: string }) {
  const t = await getTranslations("GamesPage");

  const data = await safeServerQuery<GetGamesQuery>({
    query: GET_GAMES,
    variables: { search, pagination: { skip: 0, take: 50 } },
  });

  const games = data?.games?.nodes || [];
  const gameList = games.map((game) => ({
    ...game,
    leagueCount: game._count?.leagues || 0,
    playerCount: game._count?.players || 0,
    tourneyCount: 0,
    postCount: 0,
  }));

  const showEmptySearch = gameList.length === 0 && !!search;

  if (gameList.length > 0) {
    return (
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {gameList.map((game, index) => (
          <GameCard
            key={game.id}
            game={game}
            fallbackDescription={t("cardFallbackDescription")}
            pendingLabel={t("pendingBadge")}
            priority={index < 4}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="glass-panel mb-6 flex size-20 items-center justify-center rounded-3xl">
        <Trophy className="text-muted size-10" />
      </div>
      <h3 className="text-xl font-semibold">
        {showEmptySearch ? t("noGamesFound") : t("noGamesTitle")}
      </h3>
      <p className="text-muted mt-2 max-w-sm">
        {showEmptySearch
          ? t("noGamesFoundDescription")
          : t("noGamesDescription")}
      </p>
      {showEmptySearch && (
        <Link
          href="/games"
          className={cn(
            buttonVariants({ intent: "secondary", size: "sm" }),
            "mt-6",
          )}
        >
          {t("clearSearch")}
        </Link>
      )}
    </div>
  );
}
