import { Link } from "@/i18n/routing";
import { type Ranking } from "@/lib/apollo/types";
import { useTranslations } from "next-intl";
import { Globe } from "lucide-react";

interface RankingCardProps {
  ranking: Ranking;
  game: string;
}

export function RankingCard({ ranking, game }: RankingCardProps) {
  const t = useTranslations("GamePage");

  return (
    <Link
      href={`/games/${game}/rankings/${ranking.slug}`}
      className="glass-panel group hover:border-primary/30 relative block flex h-full min-h-[320px] flex-col overflow-hidden rounded-4xl border-white/5 p-6 transition-all select-none hover:bg-white/5 active:scale-[0.99]"
    >
      {/* Background Glow */}
      <div className="bg-primary/5 absolute -top-24 -right-24 size-48 rounded-full opacity-0 blur-3xl transition-opacity group-hover:opacity-100" />

      <div className="relative mb-6 flex shrink-0 items-center justify-between gap-4">
        <div>
          <h3 className="group-hover:text-primary text-xl font-bold transition-colors">
            {ranking.name}
          </h3>
        </div>
        <div className="text-muted rounded-full border border-white/5 bg-white/5 px-3 py-1 text-[10px] font-semibold">
          {ranking.entries.length} {t("playersCount")}
        </div>
      </div>

      <div className="relative flex flex-1 flex-col">
        {ranking.entries.length > 0 ? (
          <div className="space-y-0.5">
            {ranking.entries.slice(0, 7).map((entry, i: number) => {
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
                    {entry.position}º
                  </span>

                  {country ? (
                    <span
                      className={`fi fi-${country.toLowerCase()} h-3 w-4 shrink-0 rounded-xs bg-white/5 shadow-sm`}
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
        {t("clickToViewFullRanking")} →
      </div>
    </Link>
  );
}
