import type { Route } from "next";
import { Link } from "@/i18n/routing";
import { type GetLeaguesQuery } from "@/lib/apollo/generated/graphql";
import { useTranslations } from "next-intl";

type LeagueNode = NonNullable<GetLeaguesQuery["leagues"]["nodes"][number]>;

interface LeagueCardProps {
  league: LeagueNode;
  game: string;
}

export function LeagueCard({ league, game }: LeagueCardProps) {
  const t = useTranslations("League");

  return (
    <Link
      href={`/games/${game}/events/${league.event?.slug ?? ""}` as Route}
      className="glass-panel group hover:border-primary/30 relative flex h-full min-h-80 flex-col overflow-hidden rounded-4xl border-white/5 p-6 transition-all select-none hover:bg-white/5 active:scale-[0.99]"
    >
      <div className="relative mb-6 flex shrink-0 items-center justify-between gap-4">
        <div>
          <h3 className="group-hover:text-primary text-xl font-bold transition-colors">
            {league.event?.name}
          </h3>
          <p className="text-muted mt-1 text-xs">
            {league.classificationSystem}
          </p>
        </div>
      </div>

      <div className="relative flex flex-1 flex-col">
        <div className="text-muted flex flex-1 items-center justify-center text-xs italic opacity-40">
          {t("noPlayers")}
        </div>
      </div>

      <div className="group-hover:text-primary mt-4 flex items-center justify-end text-[10px] font-bold tracking-widest text-white/20 uppercase transition-colors">
        {t("clickToViewFullLeague")} →
      </div>
    </Link>
  );
}
