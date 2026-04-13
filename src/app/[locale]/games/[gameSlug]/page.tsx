import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { getGamePageData } from "@/server/db/queries/rankings";
import { SectionHeader } from "@/components/ui/section-header";
import { getTranslations } from "next-intl/server";
import { getServerAuthSession } from "@/server/auth";
import Image from "next/image";
import {
  canEditGame,
  canManageGames,
  canManagePlayers,
  canManageRankings,
} from "@/lib/permissions";
import { RankingCard } from "@/components/cards/ranking-card";
import { AlertCircle, ChevronLeft } from "lucide-react";
import { UserChip } from "@/components/ui/user-chip";
import { Link } from "@/i18n/routing";

// Client-side Admin Panel (migrated from GameAdminActions)
import { GameAdminPanel } from "./admin-panel";
import { type Game } from "@/server/db/schema";
type GamePageProps = {
  params: Promise<{
    gameSlug: string;
  }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: GamePageProps): Promise<Metadata> {
  const { gameSlug } = await params;
  const session = await getServerAuthSession();
  const data = await getGamePageData(
    gameSlug,
    session?.user?.id,
    canManageGames(session),
  );

  const t = await getTranslations("GamePage");
  if (!data || data.isDatabaseUnavailable) {
    return {
      title: data?.isDatabaseUnavailable
        ? t("metaTitleDbUnavailable")
        : t("metaTitleNotFound"),
    };
  }

  return {
    title: data.game.name,
    description:
      data.game.description ??
      t("metaDescriptionFallback", { gameName: data.game.name }),
  };
}

export default async function GamePage({ params }: GamePageProps) {
  const { gameSlug } = await params;

  return (
    <main>
      <Suspense fallback={<GamePageSkeleton />}>
        <GamePageContent gameSlug={gameSlug} />
      </Suspense>
    </main>
  );
}

async function GamePageContent({ gameSlug }: { gameSlug: string }) {
  const session = await getServerAuthSession();
  const viewerCanManageGames = canManageGames(session);
  const data = await getGamePageData(
    gameSlug,
    session?.user?.id,
    viewerCanManageGames,
  );
  const t = await getTranslations("GamePage");
  const tPlural = await getTranslations("GamesPage");

  if (!data) {
    notFound();
  }

  if (data.isDatabaseUnavailable) {
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10 sm:px-10 lg:px-12 lg:py-14">
        <div className="glass-panel rounded-4xl p-6">
          <p className="text-base font-medium">{t("dbUnavailable")}</p>
          <p className="text-muted mt-2 text-sm leading-7">
            {t("dbUnavailableDescription")}
          </p>
        </div>
      </div>
    );
  }

  const { game, author, rankings } = data;
  const canEditCurrentGame = canEditGame(session, game.authorId);
  const viewerCanManagePlayers = canManagePlayers(session);
  const viewerCanManageRankings = canManageRankings(session);
  const canSeeAdminActions =
    canEditCurrentGame || viewerCanManagePlayers || viewerCanManageRankings;

  return (
    <div className="relative mx-auto mt-4 flex w-full max-w-7xl flex-col gap-8 px-6 pb-12 sm:px-10 lg:flex-row lg:gap-8 lg:px-12">
      {/* Sidebar */}
      <aside className="w-full shrink-0 lg:w-[320px] xl:w-[360px]">
        <div className="sticky top-28 space-y-6">
          <Link
            href="/games"
            className="group flex items-center gap-2 text-sm font-medium text-white/40 transition-colors hover:text-white"
          >
            <ChevronLeft className="size-4 transition-transform group-hover:-translate-x-1" />
            {t("backToGames")}
          </Link>

          <div className="glass-panel overflow-hidden rounded-4xl">
            <div className="relative aspect-368/178 w-full overflow-hidden">
              {game.thumbnailImageUrl ? (
                <Image
                  src={game.thumbnailImageUrl}
                  alt={game.name}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 360px"
                />
              ) : (
                <div className="from-primary/20 to-primary/5 h-full w-full bg-linear-to-br" />
              )}
            </div>

            <div className="space-y-8 p-6">
              <div>
                {game.status === "pending" && (
                  <div className="animate-pending-pulse mb-4 flex items-center gap-3 rounded-2xl border border-orange-500/20 bg-orange-500/10 px-4 py-3 text-orange-400">
                    <AlertCircle className="size-5 shrink-0 animate-pulse" />
                    <p className="text-xs font-semibold tracking-wider uppercase">
                      {t("pendingNotice")}
                    </p>
                  </div>
                )}
                <h1 className="text-foreground text-3xl font-bold tracking-tight">
                  {game.name}
                </h1>
                <p className="text-muted mt-3 text-sm leading-relaxed">
                  {game.description ?? t("sidebarDescription")}
                </p>
              </div>

              {game.status === "pending" && <></>}

              {game.status !== "pending" && (
                <div className="grid grid-cols-4 gap-2">
                  <div className="rounded-2xl border border-white/5 bg-white/5 px-3 py-2.5 transition-colors hover:bg-white/10">
                    <p className="text-muted font-mono text-[9px] tracking-wider uppercase opacity-60">
                      {tPlural("rankingsCount")}
                    </p>
                    <p className="text-secondary mt-0.5 text-lg font-bold">
                      {game.rankingCount}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/5 bg-white/5 px-3 py-2.5 transition-colors hover:bg-white/10">
                    <p className="text-muted font-mono text-[9px] tracking-wider uppercase opacity-60">
                      {tPlural("playersCount")}
                    </p>
                    <p className="text-secondary mt-0.5 text-lg font-bold">
                      {game.playerCount}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/5 bg-white/5 px-3 py-2.5 transition-colors hover:bg-white/10">
                    <p className="text-muted font-mono text-[9px] tracking-wider uppercase opacity-60">
                      {tPlural("tourneysCount")}
                    </p>
                    <p className="text-secondary mt-0.5 text-lg font-bold">
                      {game.tourneyCount}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/5 bg-white/5 px-3 py-2.5 transition-colors hover:bg-white/10">
                    <p className="text-muted font-mono text-[9px] tracking-wider uppercase opacity-60">
                      {tPlural("postsCount")}
                    </p>
                    <p className="text-secondary mt-0.5 text-lg font-bold">
                      {game.postCount}
                    </p>
                  </div>
                </div>
              )}

              {game.steamUrl && (
                <a
                  href={game.steamUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 py-2 text-xs font-bold text-white/40 transition-colors hover:text-white"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="size-4"
                  >
                    <path d="M11.979 0C5.353 0 0 5.373 0 12c0 2.221.606 4.3 1.666 6.1L6.155 13.92c-.11-.421-.168-.86-.168-1.314 0-2.868 2.324-5.193 5.19-5.193 2.87 0 5.194 2.325 5.194 5.193 0 2.868-2.324 5.194-5.193 5.194-.852 0-1.656-.205-2.36-.566L4.793 23c2.164 1.344 4.7 2.128 7.397 2.128 6.577 0 11.905-5.328 11.905-11.905S18.556 0 11.979 0Zm-.791 10.158c-1.353 0-2.45 1.097-2.45 2.448s1.097 2.45 2.45 2.45c1.35 0 2.449-1.099 2.449-2.45s-1.099-2.448-2.449-2.448Zm0 1.258c.656 0 1.19.532 1.19 1.19 0 .656-.534 1.191-1.19 1.191-.659 0-1.192-.534-1.192-1.191 0-.66.533-1.19 1.192-1.19Z" />
                  </svg>
                  {t("playOnSteam")}
                </a>
              )}
            </div>
          </div>

          {author && (
            <div className="flex flex-row-reverse items-center justify-center gap-3 px-1 py-2 opacity-80 transition-opacity hover:opacity-100">
              <div className="flex">
                <UserChip user={author} />
              </div>
              <span className="font-signature text-secondary text-lg whitespace-nowrap italic">
                {t("ideaBy")}
              </span>
            </div>
          )}

          {canSeeAdminActions && <GameAdminPanel game={game as Game} />}
        </div>
      </aside>

      {/* Main Content */}
      <div className="min-w-0 flex-1 space-y-6">
        <section className="space-y-6">
          <SectionHeader
            title={t("rankingsTitle")}
            description={t("rankingsDescription", { gameName: game.name })}
          />

          {rankings.length > 0 ? (
            <div className="grid gap-5 xl:grid-cols-2">
              {rankings.map((ranking) => (
                <RankingCard
                  key={ranking.id}
                  ranking={ranking}
                  game={gameSlug}
                />
              ))}
            </div>
          ) : (
            <div className="glass-panel rounded-4xl p-6">
              <p className="text-base font-medium">{t("noRankings")}</p>
              <p className="text-muted mt-2 text-sm leading-7">
                {t("noRankingsDescription")}
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function GamePageSkeleton() {
  return (
    <>
      <div className="relative z-10 mx-auto mt-4 flex w-full max-w-7xl flex-col gap-8 px-6 pb-12 sm:px-10 lg:flex-row lg:gap-12 lg:px-12">
        <aside className="w-full shrink-0 lg:w-[320px] xl:w-[360px]">
          <div className="sticky top-28 space-y-6">
            <div className="flex items-center gap-2">
              <div className="size-4 animate-pulse rounded bg-white/10" />
              <div className="h-4 w-24 animate-pulse rounded bg-white/10" />
            </div>
            <div className="glass-panel overflow-hidden rounded-4xl">
              <div className="aspect-368/178 w-full animate-pulse bg-white/10" />
              <div className="space-y-8 p-6">
                <div>
                  <div className="h-8 w-48 animate-pulse rounded bg-white/10" />
                  <div className="mt-4 space-y-2">
                    <div className="h-4 w-full animate-pulse rounded bg-white/6" />
                    <div className="h-4 w-5/6 animate-pulse rounded bg-white/6" />
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="h-14 animate-pulse rounded-2xl bg-white/5"
                    />
                  ))}
                </div>
                <div className="h-[50px] w-full animate-pulse rounded-xl bg-white/10" />
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 py-2">
              <div className="h-8 w-32 animate-pulse rounded-full bg-white/5" />
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1 space-y-6">
          <section className="space-y-6">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="bg-primary/30 h-8 w-24 animate-pulse rounded-full sm:h-9 sm:w-32 lg:h-10 lg:w-40" />
                  <div className="h-6 w-56 animate-pulse rounded-full bg-white/6 sm:w-[500px]" />
                </div>
              </div>
            </div>

            <div className="grid gap-5 xl:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <section
                  key={i}
                  className="glass-panel h-[280px] rounded-4xl p-6"
                >
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <div className="w-full">
                      <div className="h-6 w-32 animate-pulse rounded bg-white/10" />
                    </div>
                    <div className="h-5 w-16 shrink-0 animate-pulse rounded-full bg-white/6" />
                  </div>
                  <div className="space-y-1">
                    {[1, 2, 3, 4, 5].map((j) => (
                      <div
                        key={j}
                        className="flex h-10 w-full animate-pulse items-center border-b border-white/5 bg-white/2 py-2 last:border-0"
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
