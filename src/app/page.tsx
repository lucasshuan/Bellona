import type { Route } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { getPublicGames } from "@/server/db/queries/public";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { games: gameList, isDatabaseUnavailable } = await getPublicGames();
  const showFallbackCard = isDatabaseUnavailable || gameList.length === 0;

  return (
    <main className="grid-surface">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-6 py-12 sm:px-10 lg:px-12 lg:py-16">
        <section className="flex flex-col items-center space-y-4 text-center">
          <h1 className="text-5xl font-semibold tracking-[-0.06em] text-primary sm:text-6xl lg:text-7xl">
            Enyo
          </h1>
          <p className="max-w-2xl text-base leading-8 text-muted sm:text-lg">
            Rankings and tournaments for competitive games.
          </p>
        </section>

        <section className="space-y-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="font-mono text-sm uppercase tracking-[0.32em] text-primary sm:text-base">
                Games
              </p>
              <h2 className="mt-2 text-sm font-medium text-muted sm:text-base">
                Choose a game to view its rankings.
              </h2>
            </div>
          </div>

          {!showFallbackCard ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {gameList.map((game) => (
                <Link
                  key={game.id}
                  href={`/games/${game.id}` as Route}
                  className="glass-panel group overflow-hidden rounded-[1.8rem]"
                >
                  <div
                    className="h-44 w-full bg-cover bg-center"
                    style={{
                      backgroundImage: game.thumbnailImageUrl
                        ? `linear-gradient(180deg, rgba(11,8,15,0.08), rgba(11,8,15,0.68)), url(${game.thumbnailImageUrl})`
                        : "linear-gradient(135deg, rgba(186,17,47,0.48), rgba(11,8,15,0.92))",
                    }}
                  />

                  <div className="flex items-center justify-between gap-4 p-5">
                    <div>
                      <h3 className="text-xl font-semibold">{game.name}</h3>
                      <p className="mt-2 line-clamp-2 text-sm leading-7 text-muted">
                        {game.description ?? "Open the game page to inspect current rankings."}
                      </p>
                    </div>

                    <ChevronRight className="size-5 shrink-0 text-secondary transition-transform duration-200 group-hover:translate-x-1" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              <div
                aria-disabled="true"
                className="glass-panel overflow-hidden rounded-[1.8rem] opacity-80"
              >
                <div className="flex h-44 w-full items-center justify-center bg-gradient-to-br from-primary/22 via-primary/8 to-transparent">
                  <div className="h-16 w-16 rounded-[1.4rem] border border-white/8 bg-white/5" />
                </div>

                <div className="space-y-3 p-5">
                  <h3 className="text-xl font-semibold">No games available</h3>
                  <p className="text-sm leading-7 text-muted">
                    Add games to the database or reconnect the current database to
                    load the list here.
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
