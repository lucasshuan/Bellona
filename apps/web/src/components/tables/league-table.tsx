"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Globe } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { PlayerHoverCard } from "@/components/players/player-hover-card";

interface LeagueEntry {
  id: string;
  playerId: string;
  userId: string | null;
  country: string | null;
  currentElo: number;
  position: number;
  displayName: string;
}

interface LeagueTableProps {
  entries: LeagueEntry[];
}

export function LeagueTable({ entries }: LeagueTableProps) {
  const t = useTranslations("League");

  const columns = React.useMemo(
    () => [
      {
        header: "#",
        cell: (entry: LeagueEntry, index: number) => (
          <span
            className={`font-mono text-sm font-bold ${
              (entry.position || index) <= 3 ? "text-primary" : "opacity-30"
            }`}
          >
            {entry.position || index}º
          </span>
        ),
        className: "w-16",
      },
      {
        header: t("player"),
        cell: (entry: LeagueEntry) => (
          <div className="flex items-center">
            <PlayerHoverCard
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
        header: t("lastResult"),
        headerClassName: "text-center",
        className: "text-center",
        cell: () => (
          <span className="text-[10px] font-bold tracking-widest uppercase opacity-20">
            —
          </span>
        ),
      },
      {
        header: t("elo"),
        headerClassName: "text-right",
        className: "text-right",
        cell: (entry: LeagueEntry) => (
          <span className="text-secondary font-mono text-base font-bold">
            {entry.currentElo}
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
