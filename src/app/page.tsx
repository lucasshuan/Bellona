import type { Route } from "next";
import Link from "next/link";
import { ChevronRight, Compass } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

import { SignInButton } from "@/components/auth/sign-in-button";
import { LoginErrorHandler } from "@/components/auth/login-error-handler";
import { getPublicGames } from "@/server/db/queries/public";
import { SectionHeader } from "@/components/ui/section-header";
import { cn } from "@/lib/utils";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { games: gameList, isDatabaseUnavailable } = await getPublicGames();
  const showFallbackCard = isDatabaseUnavailable || gameList.length === 0;

  return (
    <main className="grid-surface">
      <LoginErrorHandler />
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-6 py-12 sm:px-10 lg:px-12 lg:py-16">
        <section className="relative flex flex-col items-center space-y-4 text-center">
          <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 aspect-square w-[500px] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(circle,rgba(186,17,47,0.08)_0%,transparent_70%)] sm:w-[800px]" />
          <h1 className="text-primary flex items-center justify-center gap-4 sm:gap-6 text-5xl font-semibold tracking-[-0.06em] sm:text-6xl lg:text-7xl">
            <Image
              src="/icon.svg"
              alt="Enyo"
              width={80}
              height={80}
              priority
              className="size-12 sm:size-14 lg:size-20"
              style={{
                filter:
                  "brightness(0) saturate(100%) invert(16%) sepia(92%) saturate(4203%) hue-rotate(340deg) brightness(87%) contrast(97%)",
              }}
            />
            Enyo
          </h1>
          <p className="text-muted max-w-2xl text-base leading-8 sm:text-lg">
            Rankings and tournaments for competitive games.
          </p>
          <div className="flex gap-3 pt-4 sm:gap-4">
            <Link
              href={`/#games` as Route}
              className={cn(
                buttonVariants({ intent: "secondary", size: "lg" }),
                "px-8 text-sm sm:text-base",
              )}
            >
              <Compass className="mr-2 size-5" />
              Explore
            </Link>
            <SignInButton
              size="lg"
              label="Join"
              className="text-sm sm:text-base"
            />
          </div>
        </section>

        <section className="space-y-6">
          <SectionHeader
            title="Games"
            description="Choose a game to view its rankings, performance history and ladders."
          />

          {!showFallbackCard ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {gameList.map((game) => (
                <Link
                  key={game.id}
                  href={`/games/${game.slug}` as Route}
                  className="glass-panel group flex w-full max-w-[368px] flex-col overflow-hidden rounded-[2.2rem]"
                >
                  <div className="relative aspect-[368/178] w-full overflow-hidden">
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                      style={{
                        backgroundImage: game.thumbnailImageUrl
                          ? `url(${game.thumbnailImageUrl})`
                          : "linear-gradient(135deg, rgba(186,17,47,0.48), rgba(11,8,15,0.92))",
                      }}
                    />
                    {game.thumbnailImageUrl && (
                      <div className="absolute inset-0 bg-gradient-to-b from-[#0b080f]/5 to-[#0b080f]/75 transition-opacity duration-500 group-hover:opacity-0" />
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-4 p-5">
                    <div>
                      <h3 className="text-lg font-semibold">{game.name}</h3>
                      <p className="text-muted mt-1.5 line-clamp-2 text-xs leading-4">
                        {game.description ??
                          "Open the game page to inspect current rankings."}
                      </p>
                    </div>

                    <ChevronRight className="text-secondary size-5 shrink-0 transition-transform duration-200 group-hover:translate-x-1" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <div
                aria-disabled="true"
                className="glass-panel max-w-xs overflow-hidden rounded-[1.8rem] opacity-80"
              >
                <div className="from-primary/22 via-primary/8 flex aspect-[368/178] w-full items-center justify-center bg-gradient-to-br to-transparent">
                  <div className="h-16 w-16 rounded-[1.4rem] border border-white/8 bg-white/5" />
                </div>

                <div className="space-y-2 p-5">
                  <h3 className="text-lg font-semibold">No games available</h3>
                  <p className="text-muted text-xs leading-4">
                    Add games to the database or reconnect the current database
                    to load the list here.
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
