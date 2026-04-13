import { Link } from "@/i18n/routing";
import { ChevronLeft, Trophy } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { getPublicGames } from "@/server/db/queries/public";
import { GameCard, GameCardSkeleton } from "@/components/brand/game-card";
import { SearchInput } from "@/components/ui/search-input";
import { SectionHeader } from "@/components/ui/section-header";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

interface GamesPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ search?: string; sort?: string }>;
}

export default async function GamesPage({
  params,
  searchParams,
}: GamesPageProps) {
  const t = await getTranslations("GamesPage");
  const { search, sort } = await searchParams;

  const { games: gameList, isDatabaseUnavailable } = await getPublicGames({
    search,
    orderBy: sort === "name" ? "name" : "popular",
  });

  const showEmptySearch = gameList.length === 0 && !!search;
  const showNoGames = gameList.length === 0 && !search;
  const showFallbackCard = isDatabaseUnavailable || showNoGames;

  return (
    <main className="grid-surface min-h-screen">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-12 sm:px-10 lg:px-12">
        <div className="flex flex-col gap-6">
          <Link
            href="/"
            className="text-muted hover:text-primary flex items-center gap-2 text-sm transition-colors"
          >
            <ChevronLeft className="size-4" />
            {t("backToHome")}
          </Link>

          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <SectionHeader title={t("title")} description={t("description")} />
            <SearchInput
              defaultValue={search}
              placeholder={t("searchPlaceholder")}
            />
          </div>
        </div>

        <div className="flex items-center gap-4 border-b border-white/5 pb-6">
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

        {!isDatabaseUnavailable && gameList.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {gameList.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                fallbackDescription={t("cardFallbackDescription")}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="glass-panel mb-6 flex size-20 items-center justify-center rounded-3xl">
              <Trophy className="size-10 text-white/10" />
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
        )}
      </div>
    </main>
  );
}
