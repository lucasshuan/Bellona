import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getGamePageData } from "@/server/db/queries/public";

type GamePageProps = {
  params: Promise<{
    gameId: string;
  }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: GamePageProps): Promise<Metadata> {
  const { gameId } = await params;
  const data = await getGamePageData(gameId);

  if (!data || data.isDatabaseUnavailable) {
    return {
      title: data?.isDatabaseUnavailable ? "Database unavailable" : "Game not found",
    };
  }

  return {
    title: data.game.name,
    description:
      data.game.description ?? `Rankings for ${data.game.name} on Enyo.`,
  };
}

export default async function GamePage({ params }: GamePageProps) {
  const { gameId } = await params;
  const data = await getGamePageData(gameId);

  if (!data) {
    notFound();
  }

  if (data.isDatabaseUnavailable) {
    return (
      <main className="grid-surface">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10 sm:px-10 lg:px-12 lg:py-14">
          <Link href="/" className="w-fit text-sm font-medium text-secondary">
            Back to games
          </Link>

          <div className="glass-panel rounded-[1.8rem] p-6">
            <p className="text-base font-medium">Database unavailable in local development.</p>
            <p className="mt-2 text-sm leading-7 text-muted">
              Start your Postgres instance or update `.env` with a reachable
              connection string to view this game page.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const { game, rankings } = data;

  return (
    <main className="grid-surface">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10 sm:px-10 lg:px-12 lg:py-14">
        <Link href="/" className="w-fit text-sm font-medium text-secondary">
          Back to games
        </Link>

        <section
          className="glass-panel overflow-hidden rounded-[2rem]"
          style={{
            backgroundImage: game.backgroundImageUrl
              ? `linear-gradient(180deg, rgba(11,8,15,0.24), rgba(11,8,15,0.92)), url(${game.backgroundImageUrl})`
              : "linear-gradient(135deg, rgba(186,17,47,0.32), rgba(11,8,15,0.94))",
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        >
          <div className="px-6 py-10 sm:px-8 sm:py-14 lg:px-10">
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-secondary">
              Game
            </p>
            <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-[-0.05em] sm:text-5xl lg:text-6xl">
              {game.name}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-muted sm:text-lg">
              {game.description ?? "Track rankings and player performance for this game."}
            </p>
          </div>
        </section>

        <section className="space-y-5">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-primary">
              Rankings
            </p>
            <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">
              Current ladders ordered by Elo.
            </h2>
          </div>

          {rankings.length > 0 ? (
            <div className="grid gap-5 xl:grid-cols-2">
              {rankings.map((ranking) => (
                <section
                  key={ranking.id}
                  className="glass-panel rounded-[1.8rem] p-6"
                >
                  <div className="mb-5 flex items-center justify-between gap-4">
                    <div>
                      <p className="font-mono text-xs uppercase tracking-[0.24em] text-primary">
                        Ranking
                      </p>
                      <h3 className="mt-2 text-2xl font-semibold">{ranking.name}</h3>
                    </div>
                    <div className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-medium text-secondary">
                      {ranking.entries.length} players
                    </div>
                  </div>

                  {ranking.entries.length > 0 ? (
                    <div className="space-y-3">
                      {ranking.entries.map((entry) => (
                        <article
                          key={entry.id}
                          className="rounded-[1.4rem] border border-white/8 bg-white/4 px-4 py-4"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <div className="flex items-center gap-3">
                                <span className="font-mono text-xs uppercase tracking-[0.24em] text-primary">
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
                                    className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-muted"
                                  >
                                    {username}
                                  </span>
                                ))}
                              </div>

                              {entry.country ? (
                                <p className="mt-3 text-xs uppercase tracking-[0.22em] text-muted">
                                  {entry.country}
                                </p>
                              ) : null}
                            </div>

                            <div className="rounded-2xl border border-primary/22 bg-primary/10 px-4 py-3 text-right">
                              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-secondary">
                                Elo
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
                    <div className="rounded-[1.4rem] border border-white/8 bg-white/4 px-4 py-5 text-sm leading-7 text-muted">
                      This ranking has no players yet.
                    </div>
                  )}
                </section>
              ))}
            </div>
          ) : (
            <div className="glass-panel rounded-[1.8rem] p-6">
              <p className="text-base font-medium">No rankings created for this game.</p>
              <p className="mt-2 text-sm leading-7 text-muted">
                As soon as rankings are inserted, this page will list players in
                Elo order.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
