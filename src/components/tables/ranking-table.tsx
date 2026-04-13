"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Globe } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { PlayerHoverCard } from "@/components/players/player-hover-card";

interface RankingEntry {
  id: string;
  playerId: string;
  userId: string | null;
  country: string | null;
  currentElo: number;
  position: number;
  displayName: string;
}

interface RankingTableProps {
  entries: RankingEntry[];
}

export function RankingTable({ entries }: RankingTableProps) {
  const t = useTranslations("GamePage");

  const columns = React.useMemo(
    () => [
      {
        header: "#",
        cell: (entry: RankingEntry) => (
          <span
            className={`font-mono text-sm font-bold ${
              entry.position <= 3 ? "text-primary" : "opacity-30"
            }`}
          >
            {entry.position}º
          </span>
        ),
        className: "w-16",
      },
      {
        header: t("player"),
        cell: (entry: RankingEntry) => (
          <div className="flex items-center">
            <PlayerHoverCard
              playerId={entry.playerId}
              displayName={entry.displayName}
              country={entry.country}
            >
              <div className="flex cursor-pointer items-center gap-2.5">
                <div className="flex shrink-0 items-center justify-center transition-all">
                  {entry.country ? (
                    <div className="overflow-hidden rounded-xs bg-white/5">
                      <span
                        className={`fi fi-${entry.country.toLowerCase()} h-3 w-4 shadow-sm`}
                      />
                    </div>
                  ) : (
                    <Globe className="size-3.5 text-white" />
                  )}
                </div>
                <span className="max-w-[120px] truncate text-sm font-bold text-white transition-colors hover:text-primary sm:max-w-[200px]">
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
        cell: (entry: RankingEntry) => (
          <span className="text-secondary font-mono text-base font-bold">
            {entry.currentElo}
          </span>
        ),
      },
    ],
    [t]
  );

  return (
    <DataTable
      data={entries}
      columns={columns}
      noDataMessage={t("noPlayers")}
    />
  );
}
