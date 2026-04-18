"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import type { Route } from "next";
import { ChevronRight, Trophy, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ShowcaseGame {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  thumbnailImageUrl?: string | null;
  backgroundImageUrl?: string | null;
  leagueCount: number;
  playerCount: number;
}

interface GameShowcaseProps {
  games: ShowcaseGame[];
  labels: {
    title: string;
    description: string;
    leagues: string;
    players: string;
    explore: string;
    viewAll: string;
    emptyTitle: string;
    emptyDescription: string;
  };
}

const AUTOPLAY_MS = 5500;

export function GameShowcase({ games, labels }: GameShowcaseProps) {
  const [active, setActive] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  const count = games.length;

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!isPaused && count > 1) {
      timerRef.current = setInterval(
        () => setActive((p) => (p + 1) % count),
        AUTOPLAY_MS,
      );
    }
  }, [count, isPaused]);

  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [resetTimer]);

  const select = (i: number) => {
    setActive(i);
    resetTimer();
  };

  if (count === 0) {
    return (
      <EmptyState
        title={labels.emptyTitle}
        description={labels.emptyDescription}
      />
    );
  }

  const game = games[active];

  return (
    <section className="relative space-y-10">
      {/* Header */}
      <div className="relative flex items-end justify-between gap-4">
        {/* Diagonal championship slash */}
        <div
          className="from-primary-strong via-primary/40 animate-slash-pulse pointer-events-none absolute -top-4 -bottom-4 -left-16 w-3/5 -skew-x-12 overflow-hidden rounded-r-2xl bg-linear-to-r to-transparent motion-reduce:animate-none sm:-left-20 lg:-left-24"
          aria-hidden="true"
        >
          {/* Periodic sheen sweep */}
          <div className="animate-slash-sheen pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-linear-to-r from-transparent via-white/20 to-transparent motion-reduce:hidden" />
        </div>

        <div className="relative -ml-4 sm:-ml-7 lg:-ml-10">
          <h2 className="text-2xl font-bold tracking-tight italic sm:text-3xl">
            {labels.title}
          </h2>
          <p className="text-muted mt-1 text-sm italic sm:text-base">
            {labels.description}
          </p>
        </div>
        <Link
          href="/games"
          className="group text-muted hover:text-foreground relative hidden items-center gap-1 text-sm transition-colors sm:flex"
        >
          {labels.viewAll}
          <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {/* Main showcase area */}
      <div className="relative grid gap-6 lg:grid-cols-[1fr_1.1fr] lg:gap-0">
        {/* ── Left: info panel ── */}
        <div className="relative z-10 flex flex-col justify-center lg:pr-10">
          <div key={game.id} className="animate-showcase-slide space-y-5">
            {/* Game name */}
            <h3 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              {game.name}
            </h3>

            {/* Description */}
            {game.description && (
              <p className="text-muted max-w-md text-sm leading-relaxed sm:text-base">
                {game.description}
              </p>
            )}

            {/* Stats */}
            <div className="flex gap-6">
              <Stat
                icon={Trophy}
                value={game.leagueCount}
                label={labels.leagues}
              />
              <Stat
                icon={Users}
                value={game.playerCount}
                label={labels.players}
              />
            </div>

            {/* CTA */}
            <Link
              href={`/games/${game.slug}` as Route}
              className="group/cta border-primary/30 bg-primary/8 text-primary hover:border-primary/50 hover:bg-primary/15 inline-flex items-center gap-2 rounded-full border px-6 py-2.5 text-sm font-medium transition-all"
            >
              {labels.explore}
              <ChevronRight className="size-4 transition-transform group-hover/cta:translate-x-0.5" />
            </Link>
          </div>
        </div>

        {/* ── Right: carousel card ── */}
        <div
          className="group/card relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Background glow */}
          <div
            className="bg-primary/5 pointer-events-none absolute -inset-8 rounded-full blur-[80px] transition-opacity duration-700"
            aria-hidden="true"
          />

          {/* Card */}
          <div className="glass-panel relative overflow-hidden rounded-3xl">
            {/* Image */}
            <div className="relative aspect-video w-full overflow-hidden">
              <div
                key={`img-${game.id}`}
                className="animate-showcase-fade absolute inset-0"
              >
                {game.backgroundImageUrl || game.thumbnailImageUrl ? (
                  <Image
                    src={game.backgroundImageUrl ?? game.thumbnailImageUrl!}
                    alt={game.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 55vw"
                    priority={active === 0}
                  />
                ) : (
                  <div className="from-primary/30 to-background h-full w-full bg-linear-to-br" />
                )}
              </div>

              {/* Gradient masks */}
              <div className="absolute inset-0 bg-linear-to-t from-[rgb(11_8_15/0.95)] via-transparent to-transparent" />
              <div className="absolute inset-0 bg-linear-to-r from-[rgb(11_8_15/0.4)] to-transparent lg:from-[rgb(11_8_15/0.7)]" />

              {/* Floating game title on image */}
              <div className="absolute right-5 bottom-4 left-5">
                <p className="text-xs font-medium tracking-widest text-white/40 uppercase">
                  {labels.leagues} · {game.leagueCount}
                </p>
              </div>
            </div>

            {/* Thumbnail strip / selector */}
            {count > 1 && (
              <div className="flex gap-2 p-3">
                {games.map((g, i) => (
                  <button
                    key={g.id}
                    onClick={() => select(i)}
                    className={cn(
                      "no-lift group/thumb relative h-14 flex-1 overflow-hidden rounded-xl border transition-all duration-300 sm:h-16",
                      i === active
                        ? "border-primary/40 ring-primary/20 ring-1"
                        : "border-white/5 opacity-50 hover:opacity-80",
                    )}
                  >
                    {g.thumbnailImageUrl ? (
                      <Image
                        src={g.thumbnailImageUrl}
                        alt={g.name}
                        fill
                        className="object-cover"
                        sizes="150px"
                      />
                    ) : (
                      <div className="from-primary/20 to-background h-full w-full bg-linear-to-br" />
                    )}
                    {/* Overlay name */}
                    <div className="absolute inset-0 bottom-0 flex items-center justify-center bg-black/40"></div>
                    <span className="bg-primary-strong absolute right-0 bottom-0 flex items-center justify-center rounded-tl-lg px-2 text-[8px] font-semibold tracking-wide text-white/80 shadow-md sm:text-[9px]">
                      {g.name}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Progress bar */}
            {count > 1 && (
              <div className="flex gap-1.5 px-3 pb-3">
                {games.map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "relative h-0.5 flex-1 overflow-hidden rounded-full bg-white/8",
                    )}
                  >
                    <div
                      className={cn(
                        "bg-primary/60 absolute inset-y-0 left-0 rounded-full",
                        i === active
                          ? "animate-showcase-progress"
                          : i < active
                            ? "w-full"
                            : "w-0",
                      )}
                      style={
                        i === active
                          ? ({
                              "--showcase-duration": `${AUTOPLAY_MS}ms`,
                              animationPlayState: isPaused
                                ? "paused"
                                : "running",
                            } as React.CSSProperties)
                          : undefined
                      }
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile "View all" */}
      <div className="flex justify-center sm:hidden">
        <Link
          href="/games"
          className="group text-muted hover:text-foreground inline-flex items-center gap-1 text-sm transition-colors"
        >
          {labels.viewAll}
          <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </section>
  );
}

function Stat({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: number;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex size-9 items-center justify-center rounded-xl border border-white/8 bg-white/5">
        <Icon className="text-primary size-4" />
      </div>
      <div>
        <p className="text-lg leading-none font-bold">{value}</p>
        <p className="text-muted text-xs">{label}</p>
      </div>
    </div>
  );
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section className="space-y-10">
      <div className="glass-panel flex flex-col items-center justify-center rounded-3xl py-20 text-center">
        <div className="mb-4 flex size-16 items-center justify-center rounded-2xl border border-white/8 bg-white/5">
          <Trophy className="text-muted size-7" />
        </div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-muted mt-1 max-w-sm text-sm">{description}</p>
      </div>
    </section>
  );
}
