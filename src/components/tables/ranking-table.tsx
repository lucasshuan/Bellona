"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Globe } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";

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
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 pr-4 pl-1.5 py-1 text-xs font-semibold ring-primary/20 transition-all hover:bg-white/10 hover:ring-2">
              <div className="flex shrink-0 items-center justify-center overflow-hidden rounded-xs bg-white/5">
                {entry.country ? (
                  <span
                    className={`fi fi-${entry.country.toLowerCase()} w-5 h-3.5 shadow-sm`}
                  />
                ) : (
                  <Globe className="size-3.5 text-white/30" />
                )}
              </div>
              <span className="truncate max-w-[120px] sm:max-w-[200px]">
                {entry.displayName}
              </span>
            </div>
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
