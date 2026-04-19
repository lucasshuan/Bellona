"use client";

import { useState } from "react";
import { Settings2, UserPlus } from "lucide-react";
import { ActionButton } from "@/components/ui/action-button";
import { EditLeagueModal } from "@/components/modals/league/edit-league-modal";
import { AddPlayerToLeagueModal } from "@/components/modals/league/add-player-to-league-modal";
import { useTranslations } from "next-intl";
import { useUser } from "@/components/providers";

type LeagueForPanel = {
  id: string;
  gameId: string;
  name: string;
  slug: string;
  description?: string | null;
  type: "RANKED_LEAGUE" | "STANDARD_LEAGUE";
  allowDraw?: boolean;
  allowedFormats?: string[];
  game?: { name: string; slug: string; thumbnailImageUrl?: string | null };
  initialElo?: number;
  kFactor?: number;
  scoreRelevance?: number;
  inactivityDecay?: number;
  inactivityThresholdHours?: number;
  inactivityDecayFloor?: number;
  pointsPerWin?: number;
  pointsPerDraw?: number;
  pointsPerLoss?: number;
};

interface LeagueAdminPanelProps {
  league: LeagueForPanel;
}

export function LeagueAdminPanel({ league }: LeagueAdminPanelProps) {
  const { canManageLeagues, canManagePlayers } = useUser();
  const hasAnyAction = canManageLeagues || canManagePlayers;
  const t = useTranslations();
  const [isEditLeagueOpen, setIsEditLeagueOpen] = useState(false);
  const [isAddPlayerOpen, setIsAddPlayerOpen] = useState(false);

  if (!hasAnyAction) return null;

  return (
    <div className="mt-8 space-y-3">
      <div className="mb-4 flex items-center gap-3 px-1">
        <div className="h-px flex-1 bg-white/5" />
        <span className="text-[10px] font-bold tracking-[0.2em] text-white/30 uppercase">
          {t("Admin.panel")}
        </span>
        <div className="h-px flex-1 bg-white/5" />
      </div>

      {canManageLeagues && (
        <ActionButton
          icon={Settings2}
          label={t("Modals.EditLeague.trigger")}
          onClick={() => setIsEditLeagueOpen(true)}
        />
      )}

      {canManagePlayers && (
        <ActionButton
          icon={UserPlus}
          label={t("Modals.AddPlayerToLeague.trigger")}
          onClick={() => setIsAddPlayerOpen(true)}
        />
      )}

      <EditLeagueModal
        league={{
          id: league.id,
          gameId: league.gameId,
          name: league.name,
          slug: league.slug,
          description: league.description,
          type: league.type,
          allowDraw: league.allowDraw ?? false,
          allowedFormats: league.allowedFormats ?? ["ONE_V_ONE"],
          game: league.game ?? { name: "", slug: "" },
          initialElo: league.initialElo,
          kFactor: league.kFactor,
          scoreRelevance: league.scoreRelevance,
          inactivityDecay: league.inactivityDecay,
          inactivityThresholdHours: league.inactivityThresholdHours,
          inactivityDecayFloor: league.inactivityDecayFloor,
          pointsPerWin: league.pointsPerWin,
          pointsPerDraw: league.pointsPerDraw,
          pointsPerLoss: league.pointsPerLoss,
        }}
        isOpen={isEditLeagueOpen}
        onClose={() => setIsEditLeagueOpen(false)}
      />

      <AddPlayerToLeagueModal
        gameId={league.gameId}
        leagueId={league.id}
        leagueType="elo"
        isOpen={isAddPlayerOpen}
        onClose={() => setIsAddPlayerOpen(false)}
      />
    </div>
  );
}
