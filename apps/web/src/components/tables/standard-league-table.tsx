"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Globe } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { PlayerHoverCard } from "@/components/players/player-hover-card";

interface StandardLeagueEntry {
  id: string;
  playerId: string;
  userId: string | null;
  country: string | null;
  points: number;
  wins: number;
  draws: number;
  losses: number;
  position: number;
  displayName: string;
}

interface StandardLeagueTableProps {
  entries: StandardLeagueEntry[];
}

export function StandardLeagueTable({ entries }: StandardLeagueTableProps) {
  const t = useTranslations("GamePage");

  const columns = React.useMemo(
    () => [
      {
        header: "#",
        cell: (entry: StandardLeagueEntry, index: number) => (
          <span
            className={`font-mono text-sm font-bold ${(entry.position || index) <= 3 ? "text-primary" : "opacity-30"}`}
          >
            {entry.position || index}º
          </span>
        ),
        className: "w-16",
      },
      {
        header: t("player"),
        cell: (entry: StandardLeagueEntry) => (
          <div className="flex items-center">
            <PlayerHoverCard
              playerId={entry.playerId}
              displayName={entry.displayName}
              country={entry.country}
            >
              <div className="flex cursor-pointer items-center gap-2.5">
                <div className="flex shrink-0 items-center justify-center transition-all">
                  {entry.country ? (
                    <span
                      className={`fi fi-${entry.country.toLowerCase()} h-3 w-4 rounded-xs`}
                    />
                  ) : (
                    <Globe className="size-3.5 text-white" />
                  )}
                </div>
                <span className="hover:text-primary max-w-30 truncate text-sm font-bold text-white transition-colors sm:max-w-50">
                  {entry.displayName}
                </span>
              </div>
            </PlayerHoverCard>
          </div>
        ),
      },
      {
        header: t("wins"),
        headerClassName: "text-center",
        className: "text-center",
        cell: (entry: StandardLeagueEntry) => (
          <span className="text-success/70 font-mono text-sm font-bold">
            {entry.wins}
          </span>
        ),
      },
      {
        header: t("draws"),
        headerClassName: "text-center",
        className: "text-center",
        cell: (entry: StandardLeagueEntry) => (
          <span className="text-warning/70 font-mono text-sm font-bold">
            {entry.draws}
          </span>
        ),
      },
      {
        header: t("losses"),
        headerClassName: "text-center",
        className: "text-center",
        cell: (entry: StandardLeagueEntry) => (
          <span className="text-danger/70 font-mono text-sm font-bold">
            {entry.losses}
          </span>
        ),
      },
      {
        header: t("points"),
        headerClassName: "text-right",
        className: "text-right",
        cell: (entry: StandardLeagueEntry) => (
          <span className="text-secondary font-mono text-base font-bold">
            {entry.points}
          </span>
        ),
      },
    ],
    [t],
  );

  return (
    <DataTable
      data={entries}
      columns={columns}
      noDataMessage={t("noPlayers")}
    />
  );
}
