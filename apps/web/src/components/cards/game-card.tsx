import type { Route } from "next";
import { Link } from "@/i18n/routing";
import { ChevronRight } from "lucide-react";
import { type Game } from "@/lib/apollo/types";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface GameCardProps {
  game: Game;
  fallbackDescription?: string;
  pendingLabel?: string;
}

export function GameCard({
  game,
  fallbackDescription,
  pendingLabel,
}: GameCardProps) {
  return (
    <Link
      href={`/games/${game.slug}` as Route}
      className="glass-panel group flex w-full flex-col overflow-hidden rounded-4xl"
    >
      <div className="relative aspect-368/178 w-full overflow-hidden">
        {game.thumbnailImageUrl ? (
          <Image
            src={game.thumbnailImageUrl}
            alt={game.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            quality={75}
          />
        ) : (
          <div className="from-primary/48 h-full w-full bg-linear-to-br to-[#0b080f]/92 transition-transform duration-500 group-hover:scale-105" />
        )}

        <div className="absolute inset-0 bg-linear-to-b from-[#0b080f]/0 to-[#0b080f]/80 transition-opacity duration-500 group-hover:opacity-40" />
      </div>

      <div className="flex min-h-[6.5rem] flex-col px-5 pt-5 pb-8">
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 flex-1 text-lg leading-tight font-semibold">
            {game.name}
          </h3>
          {game.status === "pending" && pendingLabel && (
            <span className="animate-pending-pulse inline-flex shrink-0 items-center gap-1.5 rounded-full border border-amber-400/20 bg-amber-500/12 px-2.5 py-1 text-[10px] font-semibold tracking-[0.18em] text-amber-200 uppercase">
              <span className="size-2 animate-pulse rounded-full bg-amber-400" />
              {pendingLabel}
            </span>
          )}
        </div>

        <div className="flex items-start justify-between gap-4">
          <p className="text-muted line-clamp-2 flex-1 text-xs leading-4">
            {game.description ?? fallbackDescription}
          </p>
          <div className="flex h-5 items-center">
            <ChevronRight className="text-secondary size-5 shrink-0 transition-transform duration-200 group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </Link>
  );
}

export function GameCardSkeleton({
  title,
  description,
}: {
  title?: string;
  description?: string;
}) {
  const isFallbackState = !!title;

  return (
    <div
      aria-disabled="true"
      className={cn(
        "glass-panel flex w-full flex-col overflow-hidden rounded-4xl",
        isFallbackState && "opacity-80",
      )}
    >
      <div className="relative aspect-368/178 w-full overflow-hidden">
        {isFallbackState ? (
          <div className="from-primary/22 via-primary/8 flex h-full w-full items-center justify-center bg-linear-to-br to-transparent">
            <div className="h-16 w-16 rounded-3xl border border-white/8 bg-white/5" />
          </div>
        ) : (
          <div className="h-full w-full animate-pulse bg-white/5" />
        )}
      </div>

      <div className="flex items-center justify-between gap-4 px-5 pt-5 pb-8">
        <div className="w-full min-w-0">
          {isFallbackState ? (
            <>
              <h3 className="truncate text-lg font-semibold">{title}</h3>
              <p className="text-muted mt-1.5 line-clamp-2 text-xs leading-4">
                {description}
              </p>
            </>
          ) : (
            <div className="space-y-3">
              <div className="h-5 w-32 animate-pulse rounded bg-white/10" />
              <div className="space-y-1.5">
                <div className="h-3 w-full animate-pulse rounded bg-white/5" />
                <div className="h-3 w-3/4 animate-pulse rounded bg-white/5" />
              </div>
            </div>
          )}
        </div>
        {!isFallbackState && (
          <div className="size-5 shrink-0 animate-pulse rounded bg-white/5" />
        )}
      </div>
    </div>
  );
}
