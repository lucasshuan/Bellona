import { type GetLeagueQuery } from "@/lib/apollo/generated/graphql";
import { Session } from "next-auth";

type LeagueData = NonNullable<GetLeagueQuery["league"]>;

interface EloLeagueTemplateProps {
  league: LeagueData;
  session: Session | null;
  isEditor: boolean;
}

export function EloLeagueTemplate({ league }: EloLeagueTemplateProps) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-12 text-center">
      <h1 className="text-3xl font-bold">{league.event?.name}</h1>
      <p className="text-muted mt-4">
        ELO League — {league.classificationSystem}
      </p>
    </div>
  );
}
