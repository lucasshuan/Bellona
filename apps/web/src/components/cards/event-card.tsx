import type { Route } from "next";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import { Globe } from "lucide-react";
import { useTranslations } from "next-intl";
import { type GetLeaguesQuery } from "@/lib/apollo/generated/graphql";
import { cn } from "@/lib/utils";

type EventNode = GetLeaguesQuery["leagues"]["nodes"][number];

interface EventCardProps {
  event: EventNode;
}

export function EventCard({ event }: EventCardProps) {
  const t = useTranslations("EventsPage");

  const isLeague = event.type === "LEAGUE";

  return (
    <Link
      href={`/games/${event.game.slug}/events/${event.slug}` as Route}
      className="glass-panel group hover:border-primary/30 relative flex h-full min-h-80 flex-col overflow-hidden rounded-4xl border-white/5 p-6 transition-all select-none hover:bg-white/5 active:scale-[0.99]"
    >
      {/* Header */}
      <div className="relative mb-4 flex shrink-0 items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1.5">
          <h3 className="group-hover:text-primary line-clamp-2 text-xl font-bold transition-colors">
            {event.name}
          </h3>

          {/* Game chip */}
          <div className="flex items-center gap-1.5">
            {event.game.thumbnailImageUrl ? (
              <Image
                src={event.game.thumbnailImageUrl}
                alt={event.game.name}
                width={16}
                height={16}
                className="size-4 rounded-sm object-cover opacity-70"
              />
            ) : null}
            <span className="text-muted truncate text-xs font-medium">
              {event.game.name}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1.5">
          {/* Player count */}
          <div className="text-muted rounded-full border border-white/5 bg-white/5 px-3 py-1 text-[10px] font-semibold whitespace-nowrap">
            {t("players", { count: event.entries.length })}
          </div>
          {/* Type badge */}
          <span
            className={cn(
              "rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase",
              isLeague
                ? "bg-primary/15 text-primary border-primary/20 border"
                : "border border-amber-400/20 bg-amber-500/12 text-amber-300",
            )}
          >
            {isLeague ? t("leagueType") : t("tournamentType")}
          </span>
        </div>
      </div>

      <div className="mb-4 border-b border-white/5" />

      {/* Player list */}
      <div className="relative flex flex-1 flex-col">
        {event.entries.length > 0 ? (
          <div className="space-y-0.5">
            {event.entries.slice(0, 7).map((entry, i) => {
              const user = entry.player?.user;
              const displayName = user?.name || user?.username || "";
              const country = user?.country;

              return (
                <div
                  key={entry.id}
                  style={{
                    opacity: i >= 3 ? Math.max(0, 1 - (i - 2) * 0.3) : 1,
                    filter: i >= 3 ? `blur(${(i - 2) * 0.5}px)` : "none",
                  }}
                  className="flex items-center gap-3 border-b border-white/5 py-2 last:border-0"
                >
                  <span className="text-primary w-6 shrink-0 font-mono text-[10px] font-bold">
                    {entry.position ?? i + 1}º
                  </span>

                  {country ? (
                    <span
                      className={`fi fi-${country.toLowerCase()} h-3 w-4 shrink-0 rounded-xs`}
                    />
                  ) : (
                    <Globe className="size-3 shrink-0 text-white/30" />
                  )}

                  <span className="text-foreground/80 flex-1 truncate text-xs font-semibold transition-colors group-hover:text-white">
                    {displayName}
                  </span>

                  <span className="text-secondary shrink-0 font-mono text-[11px] font-bold opacity-60">
                    {entry.currentElo}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-muted flex flex-1 items-center justify-center text-xs italic opacity-40">
            {t("noPlayers")}
          </div>
        )}
      </div>

      <div className="group-hover:text-primary mt-4 flex items-center justify-end text-[10px] font-bold tracking-widest text-white/20 uppercase transition-colors">
        View event →
      </div>
    </Link>
  );
}

export function EventCardSkeleton() {
  return (
    <div className="glass-panel flex h-full min-h-80 flex-col overflow-hidden rounded-4xl p-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex flex-1 flex-col gap-2">
          <div className="h-6 w-40 animate-pulse rounded bg-white/10" />
          <div className="h-3 w-24 animate-pulse rounded bg-white/5" />
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <div className="h-5 w-20 animate-pulse rounded-full bg-white/5" />
          <div className="h-4 w-14 animate-pulse rounded-full bg-white/5" />
        </div>
      </div>
      <div className="mb-4 border-b border-white/5" />
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3 py-1">
            <div className="h-3 w-5 animate-pulse rounded bg-white/10" />
            <div className="h-3 w-4 animate-pulse rounded bg-white/5" />
            <div className="h-3 flex-1 animate-pulse rounded bg-white/5" />
            <div className="h-3 w-8 animate-pulse rounded bg-white/5" />
          </div>
        ))}
      </div>
    </div>
  );
}
