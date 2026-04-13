import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { getGamePageData } from "@/server/db/queries/public";
import { SectionHeader } from "@/components/ui/section-header";
import { getTranslations } from "next-intl/server";

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
  const data = await getGamePageData(gameSlug);

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
  const data = await getGamePageData(gameSlug);
  const t = await getTranslations("GamePage");

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

  const { game, rankings } = data;
  const totalPlayersNumber = rankings.reduce(
    (acc, ranking) => acc + ranking.entries.length,
    0,
  );

  return (
    <>
      <section className="relative min-h-[230px] w-full overflow-hidden">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: game.backgroundImageUrl
              ? `linear-gradient(180deg, rgba(11,8,15,0.4) 0%, rgba(11,8,15,0) 100%), url(${game.backgroundImageUrl})`
              : "linear-gradient(135deg, color-mix(in srgb, var(--primary) 32%, transparent), rgba(11,8,15,0.94))",
            backgroundPosition: "center",
            backgroundSize: "cover",
            maskImage:
              "linear-gradient(to bottom, black 60%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, black 60%, transparent 100%)",
          }}
        />
      </section>

      <div className="relative z-10 mx-auto mt-4 flex w-full max-w-7xl flex-col gap-8 px-6 pb-12 sm:px-10 lg:flex-row lg:gap-12 lg:px-12">
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
                  <section
                    key={ranking.id}
                    className="glass-panel rounded-4xl p-6"
                  >
                    <div className="mb-5 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-primary font-mono text-xs tracking-[0.24em] uppercase">
                          {t("ranking")}
                        </p>
                        <h3 className="mt-2 text-2xl font-semibold">
                          {ranking.name}
                        </h3>
                      </div>
                      <div className="border-primary/25 bg-primary/10 text-secondary rounded-full border px-3 py-1 text-xs font-medium">
                        {ranking.entries.length} {t("playersCount")}
                      </div>
                    </div>

                    {ranking.entries.length > 0 ? (
                      <div className="space-y-3">
                        {ranking.entries.map((entry) => (
                          <article
                            key={entry.id}
                            className="rounded-3xl border border-white/8 bg-white/4 px-4 py-4"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="min-w-0">
                                <div className="flex items-center gap-3">
                                  <span className="text-primary font-mono text-xs tracking-[0.24em] uppercase">
                                    #{entry.position}
                                  </span>
                                  <h4 className="truncate text-lg font-semibold">
                                    {entry.displayName}
                                  </h4>
                                </div>

                                <div className="mt-2 flex flex-wrap gap-2">
                                  {entry.usernames.map((username) => (
                                    <span
                                      key={`${entry.id}-${username}`}
                                      className="text-muted rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs"
                                    >
                                      {username}
                                    </span>
                                  ))}
                                </div>

                                {entry.country ? (
                                  <p className="text-muted mt-3 text-xs tracking-[0.22em] uppercase">
                                    {entry.country}
                                  </p>
                                ) : null}
                              </div>

                              <div className="border-primary/22 bg-primary/10 rounded-2xl border px-4 py-3 text-right">
                                <p className="text-secondary font-mono text-[11px] tracking-[0.22em] uppercase">
                                  {t("elo")}
                                </p>
                                <p className="mt-1 text-2xl font-semibold">
                                  {entry.currentElo}
                                </p>
                              </div>
                            </div>
                          </article>
                        ))}
                      </div>
                    ) : (
                      <div className="text-muted rounded-3xl border border-white/8 bg-white/4 px-4 py-5 text-sm leading-7">
                        {t("noPlayers")}
                      </div>
                    )}
                  </section>
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

        {/* Sidebar */}
        <aside className="w-full shrink-0 lg:w-[320px] xl:w-[360px]">
          <div className="glass-panel sticky top-8 overflow-hidden rounded-4xl">
            {game.thumbnailImageUrl ? (
              <div
                className="aspect-368/178 w-full bg-cover bg-center"
                style={{ backgroundImage: `url(${game.thumbnailImageUrl})` }}
              />
            ) : (
              <div className="from-primary/20 to-primary/5 aspect-368/178 w-full bg-linear-to-br" />
            )}

            <div className="space-y-8 p-6">
              <div>
                <h1 className="text-foreground text-3xl font-bold tracking-tight">
                  {game.name}
                </h1>
                <p className="text-muted mt-3 text-sm leading-relaxed">
                  {game.description ?? t("sidebarDescription")}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/5 bg-white/5 p-4 transition-colors hover:bg-white/10">
                  <p className="text-muted font-mono text-xs tracking-wider uppercase">
                    {t("rankingsTitle")}
                  </p>
                  <p className="text-secondary mt-1 text-2xl font-semibold">
                    {rankings.length}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/5 bg-white/5 p-4 transition-colors hover:bg-white/10">
                  <p className="text-muted font-mono text-xs tracking-wider uppercase">
                    {t("sidebarPlayers")}
                  </p>
                  <p className="text-secondary mt-1 text-2xl font-semibold">
                    {totalPlayersNumber}
                  </p>
                </div>
              </div>

              {game.steamUrl && (
                <a
                  href={game.steamUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex w-full items-center justify-center gap-3 rounded-xl border border-[#66c0f4]/20 bg-[#1b2838] px-4 py-3.5 text-sm font-semibold text-white transition-all hover:bg-[#2a475e] hover:shadow-[0_0_15px_rgba(102,192,244,0.2)]"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="size-5"
                  >
                    <path d="M11.979 0C5.353 0 0 5.373 0 12c0 2.221.606 4.3 1.666 6.1L6.155 13.92c-.11-.421-.168-.86-.168-1.314 0-2.868 2.324-5.193 5.19-5.193 2.87 0 5.194 2.325 5.194 5.193 0 2.868-2.324 5.194-5.193 5.194-.852 0-1.656-.205-2.36-.566L4.793 23c2.164 1.344 4.7 2.128 7.397 2.128 6.577 0 11.905-5.328 11.905-11.905S18.556 0 11.979 0Zm-.791 10.158c-1.353 0-2.45 1.097-2.45 2.448s1.097 2.45 2.45 2.45c1.35 0 2.449-1.099 2.449-2.45s-1.099-2.448-2.449-2.448Zm0 1.258c.656 0 1.19.532 1.19 1.19 0 .656-.534 1.191-1.19 1.191-.659 0-1.192-.534-1.192-1.191 0-.66.533-1.19 1.192-1.19Z" />
                  </svg>
                  {t("playOnSteam")}
                </a>
              )}
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}

function GamePageSkeleton() {
  return (
    <>
      <section className="relative min-h-[230px] w-full overflow-hidden">
        <div className="absolute inset-0 z-0 animate-pulse bg-white/5" />
      </section>

      <div className="relative z-10 mx-auto mt-4 flex w-full max-w-7xl flex-col gap-8 px-6 pb-12 sm:px-10 lg:flex-row lg:gap-12 lg:px-12">
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
              {[1, 2].map((i) => (
                <section key={i} className="glass-panel rounded-4xl p-6">
                  <div className="mb-5 flex items-center justify-between gap-4">
                    <div className="w-full">
                      <div className="bg-primary/30 h-3 w-16 animate-pulse rounded" />
                      <div className="mt-2 h-7 w-48 animate-pulse rounded bg-white/10" />
                    </div>
                    <div className="h-6 w-16 shrink-0 animate-pulse rounded-full bg-white/6" />
                  </div>
                  <div className="space-y-3">
                    {[1, 2, 3].map((j) => (
                      <div
                        key={j}
                        className="h-[88px] w-full animate-pulse rounded-3xl bg-white/6"
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </section>
        </div>

        <aside className="w-full shrink-0 lg:w-[320px] xl:w-[360px]">
          <div className="glass-panel sticky top-8 overflow-hidden rounded-4xl">
            <div className="aspect-368/178 w-full animate-pulse bg-white/10" />
            <div className="space-y-8 p-6">
              <div>
                <div className="h-8 w-48 animate-pulse rounded bg-white/10" />
                <div className="mt-4 space-y-2">
                  <div className="h-4 w-full animate-pulse rounded bg-white/6" />
                  <div className="h-4 w-5/6 animate-pulse rounded bg-white/6" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="h-[76px] animate-pulse rounded-2xl bg-white/5" />
                <div className="h-[76px] animate-pulse rounded-2xl bg-white/5" />
              </div>
              <div className="h-[50px] w-full animate-pulse rounded-xl bg-white/10" />
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
