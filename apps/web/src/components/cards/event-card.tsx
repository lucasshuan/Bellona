import type { Route } from "next";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { type GetLeaguesQuery } from "@/lib/apollo/generated/graphql";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/date-utils";

type LeagueNode = NonNullable<GetLeaguesQuery["leagues"]["nodes"][number]>;

interface EventCardProps {
  event: LeagueNode;
}

export function EventCard({ event }: EventCardProps) {
  const t = useTranslations("EventsPage");

  const isApproved = event.event?.isApproved ?? false;
  const gameName = event.event?.game?.name ?? "";
  const gameThumbnail = event.event?.game?.thumbnailImageUrl;
  const gameSlug = event.event?.game?.slug ?? "";
  const eventSlug = event.event?.slug ?? "";
  const eventName = event.event?.name ?? "";

  return (
    <Link
      href={`/games/${gameSlug}/events/${eventSlug}` as Route}
      className="glass-panel group hover:border-primary/30 relative flex h-full min-h-80 flex-col overflow-hidden rounded-4xl border-white/5 p-6 transition-all select-none hover:bg-white/5 active:scale-[0.99]"
    >
      {/* Header */}
      <div className="relative mb-4 flex shrink-0 items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1.5">
          <h3 className="group-hover:text-primary line-clamp-2 text-xl font-bold transition-colors">
            {eventName}
          </h3>

          {/* Game chip */}
          <div className="flex items-center gap-1.5">
            {gameThumbnail ? (
              <Image
                src={gameThumbnail}
                alt={gameName}
                width={16}
                height={16}
                className="size-4 rounded-sm object-cover opacity-70"
              />
            ) : null}
            <span className="text-muted truncate text-xs font-medium">
              {gameName}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1.5">
          {/* Classification badge */}
          <span
            className={cn(
              "rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase",
              "bg-primary/15 text-primary border-primary/20 border",
            )}
          >
            {event.classificationSystem}
          </span>

          {!isApproved && (
            <span className="rounded-full border border-amber-400/20 bg-amber-500/12 px-2.5 py-0.5 text-[10px] font-semibold tracking-wide text-amber-300 uppercase">
              {t("pendingApproval")}
            </span>
          )}
        </div>
      </div>

      <div className="mb-4 border-b border-white/5" />

      <div className="relative flex flex-1 flex-col justify-center">
        {event.event?.startDate ? (
          <p className="text-muted text-xs">
            {formatDate(event.event.startDate)}
          </p>
        ) : (
          <p className="text-muted text-xs italic opacity-40">
            {t("noStartDate")}
          </p>
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
