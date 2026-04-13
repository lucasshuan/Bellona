import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import { ChevronLeft } from "lucide-react";

import { getRankingData } from "@/server/db/queries/rankings";
import { SectionHeader } from "@/components/ui/section-header";
import { getServerAuthSession } from "@/server/auth";
import { canManageGames, canManageRankings } from "@/lib/permissions";
import { RankingRegistrationTrigger } from "@/components/triggers/ranking/ranking-registration-trigger";
import { getLocale } from "next-intl/server";
import { formatDate } from "@/lib/date-utils";
import { RankingTable } from "@/components/tables/ranking-table";

import { RankingAdminPanel } from "./admin-panel";
import { type Ranking } from "@/server/db/schema";

interface RankingPageProps {
  params: Promise<{
    gameSlug: string;
    rankingSlug: string;
  }>;
}

export default async function RankingPage({ params }: RankingPageProps) {
  const { gameSlug, rankingSlug } = await params;

  return (
    <main>
      <Suspense fallback={<RankingPageSkeleton />}>
        <RankingPageContent gameSlug={gameSlug} rankingSlug={rankingSlug} />
      </Suspense>
    </main>
  );
}

async function RankingPageContent({
  gameSlug,
  rankingSlug,
}: {
  gameSlug: string;
  rankingSlug: string;
}) {
  const session = await getServerAuthSession();
  const data = await getRankingData(
    gameSlug,
    rankingSlug,
    session?.user?.id,
    canManageGames(session),
  );
  const isEditor = canManageRankings(session);
  const t = await getTranslations("GamePage");
  const locale = await getLocale();

  if (!data) {
    notFound();
  }

  const { ranking, game, entries } = data;

  const isUserRegistered = session?.user?.id
    ? entries.some((e) => e.userId === session.user.id)
    : false;

  return (
    <div className="relative mx-auto mt-4 flex w-full max-w-7xl flex-col gap-8 px-6 pb-12 sm:px-10 lg:flex-row lg:gap-8 lg:px-12">
      {/* Sidebar (Left) */}
      <aside className="w-full shrink-0 lg:w-[320px] xl:w-[360px]">
        <div className="sticky top-28 space-y-4">
          <Link
            href={`/games/${gameSlug}`}
            className="glass-panel group flex items-center gap-3 overflow-hidden rounded-3xl p-2 transition-all hover:bg-white/5 active:scale-[0.98]"
          >
            <ChevronLeft className="size-4 shrink-0 opacity-40 transition-transform group-hover:-translate-x-0.5" />
            <div className="relative aspect-video h-10 shrink-0 overflow-hidden rounded-xl shadow-2xl">
              {game.thumbnailImageUrl ? (
                <Image
                  src={game.thumbnailImageUrl}
                  alt={game.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="from-primary/20 h-full w-full bg-linear-to-br" />
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-muted text-[9px] font-bold tracking-widest uppercase opacity-50">
                {game.name}
              </span>
              <span className="text-secondary group-hover:text-primary text-[11px] font-bold tracking-wider uppercase transition-colors">
                {t("viewGame")}
              </span>
            </div>
          </Link>

          <div className="glass-panel overflow-hidden rounded-4xl p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
              <svg
                className="text-primary size-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {t("rankingInfo")}
            </h2>

            <div className="space-y-1">
              <div className="flex items-center justify-between py-1">
                <span className="text-[11px] opacity-60">
                  {t("totalPlayers")}
                </span>
                <span className="text-secondary text-xs font-semibold">
                  {entries.length}
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-[11px] opacity-60">
                  {t("ratingSystem")}
                </span>
                <span className="text-xs font-semibold uppercase">
                  {ranking.ratingSystem}
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-[11px] opacity-60">{t("created")}</span>
                <span className="text-xs font-semibold">
                  {ranking.createdAt
                    ? formatDate(ranking.createdAt, locale)
                    : "—"}
                </span>
              </div>
              <div className="pt-3">
                <p className="text-muted text-[10px] leading-relaxed italic opacity-50">
                  {t("rankingInfoDescription")}
                </p>
              </div>
            </div>
          </div>

          {game.status === "approved" && (
            <RankingRegistrationTrigger
              rankingId={ranking.id}
              initialElo={ranking.initialElo}
              isRegistered={isUserRegistered}
              isLoggedIn={!!session?.user}
            />
          )}

          {game.status === "approved" && isEditor && (
            <RankingAdminPanel ranking={ranking as Ranking} />
          )}
        </div>
      </aside>

      {/* Main Content (Right) */}
      <div className="min-w-0 flex-1 space-y-8">
        <SectionHeader
          title={ranking.name}
          description={
            ranking.description || (
              <span className="italic opacity-50">{t("noDescription")}</span>
            )
          }
        />

        <RankingTable entries={entries} />
      </div>
    </div>
  );
}

function RankingPageSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="mx-auto mt-4 flex max-w-7xl flex-col gap-8 px-6 pb-12 sm:px-10 lg:flex-row lg:gap-12 lg:px-12">
        {/* Sidebar */}
        <div className="w-full space-y-4 lg:w-[320px] xl:w-[360px]">
          <div className="h-14 w-full rounded-3xl bg-white/5" />
          <div className="h-64 w-full rounded-4xl bg-white/5" />
          <div className="h-14 w-full rounded-2xl bg-white/5" />
        </div>

        {/* Main Content */}
        <div className="min-w-0 flex-1 space-y-8">
          <div className="space-y-4">
            <div className="h-10 w-64 rounded-full bg-white/10" />
            <div className="h-6 w-full rounded-full bg-white/5" />
          </div>
          <div className="glass-panel overflow-hidden rounded-4xl">
            <div className="flex border-b border-white/10 bg-white/2 px-5 py-3">
              <div className="h-4 w-8 rounded-full bg-white/10" />
              <div className="ml-12 h-4 w-32 rounded-full bg-white/10" />
              <div className="ml-auto h-4 w-12 rounded-full bg-white/10" />
              <div className="ml-12 h-4 w-24 rounded-full bg-white/10" />
            </div>
            <div className="space-y-1 p-1">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="flex items-center px-5 py-4">
                  <div className="h-5 w-6 rounded-md bg-white/5" />
                  <div className="ml-12 h-8 w-48 rounded-full bg-white/5" />
                  <div className="ml-auto h-6 w-14 rounded-md bg-white/5" />
                  <div className="ml-12 h-4 w-20 rounded-md bg-white/5" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
