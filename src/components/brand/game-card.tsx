import type { Route } from "next";
import { Link } from "@/i18n/routing";
import { ChevronRight } from "lucide-react";
import type { PublicGame } from "@/server/db/queries/public";

interface GameCardProps {
  game: PublicGame;
  fallbackDescription?: string;
}

export function GameCard({ game, fallbackDescription }: GameCardProps) {
  return (
    <Link
      href={`/games/${game.slug}` as Route}
      className="glass-panel group flex w-full flex-col overflow-hidden rounded-[2.2rem]"
    >
      <div className="relative aspect-[368/178] w-full overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
          style={{
            backgroundImage: game.thumbnailImageUrl
              ? `url(${game.thumbnailImageUrl})`
              : "linear-gradient(135deg, color-mix(in srgb, var(--primary) 48%, transparent), rgba(11,8,15,0.92))",
          }}
        />
        {game.thumbnailImageUrl && (
          <div className="absolute inset-0 bg-gradient-to-b from-[#0b080f]/5 to-[#0b080f]/75 transition-opacity duration-500 group-hover:opacity-0" />
        )}
      </div>

      <div className="flex items-center justify-between gap-4 p-5">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-semibold">{game.name}</h3>
          <p className="text-muted mt-1.5 line-clamp-2 text-xs leading-4">
            {game.description ?? fallbackDescription}
          </p>
        </div>

        <ChevronRight className="text-secondary size-5 shrink-0 transition-transform duration-200 group-hover:translate-x-1" />
      </div>
    </Link>
  );
}

export function GameCardSkeleton({ title, description }: { title: string; description: string }) {
  return (
    <div
      aria-disabled="true"
      className="glass-panel w-full overflow-hidden rounded-[1.8rem] opacity-80"
    >
      <div className="from-primary/22 via-primary/8 flex aspect-[368/178] w-full items-center justify-center bg-gradient-to-br to-transparent">
        <div className="h-16 w-16 rounded-[1.4rem] border border-white/8 bg-white/5" />
      </div>

      <div className="space-y-2 p-5">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-muted text-xs leading-4">
          {description}
        </p>
      </div>
    </div>
  );
}
