import { type GetLeagueQuery } from "@/lib/apollo/generated/graphql";
import { Session } from "next-auth";

type LeagueData = NonNullable<GetLeagueQuery["league"]>;

interface StandardLeagueTemplateProps {
  league: LeagueData;
  session: Session | null;
  isEditor: boolean;
}

export function StandardLeagueTemplate({
  league,
}: StandardLeagueTemplateProps) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-12 text-center">
      <h1 className="text-3xl font-bold">{league.event?.name}</h1>
      <p className="text-muted mt-4">
        Standard League — {league.classificationSystem}
      </p>
    </div>
  );
}
