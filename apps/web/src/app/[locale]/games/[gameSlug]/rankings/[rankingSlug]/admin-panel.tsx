"use client";

import { useState } from "react";
import { Settings2, UserPlus } from "lucide-react";
import { ActionButton } from "@/components/ui/action-button";
import { EditRankingModal } from "@/components/modals/ranking/edit-ranking-modal";
import { AddPlayerToRankingModal } from "@/components/modals/ranking/add-player-to-ranking-modal";
import { type Ranking } from "@/lib/apollo/types";
import { useTranslations } from "next-intl";
import { useUser } from "@/components/providers";

interface RankingAdminPanelProps {
  ranking: Ranking;
}

export function RankingAdminPanel({ ranking }: RankingAdminPanelProps) {
  const { canManageRankings, canManagePlayers } = useUser();
  const hasAnyAction = canManageRankings || canManagePlayers;
  const t = useTranslations("Admin");
  const tModals = useTranslations("Modals");
  const [isEditRankingOpen, setIsEditRankingOpen] = useState(false);
  const [isAddPlayerOpen, setIsAddPlayerOpen] = useState(false);

  if (!hasAnyAction) return null;

  return (
    <div className="mt-8 space-y-3">
      <div className="mb-4 flex items-center gap-3 px-1">
        <div className="h-px flex-1 bg-white/5" />
        <span className="text-[10px] font-bold tracking-[0.2em] text-white/30 uppercase">
          {t("panel")}
        </span>
        <div className="h-px flex-1 bg-white/5" />
      </div>

      {canManageRankings && (
        <ActionButton
          icon={Settings2}
          label={tModals("EditRanking.trigger")}
          onClick={() => setIsEditRankingOpen(true)}
        />
      )}

      {canManagePlayers && (
        <ActionButton
          icon={UserPlus}
          label={tModals("AddPlayerToRanking.trigger")}
          onClick={() => setIsAddPlayerOpen(true)}
        />
      )}

      <EditRankingModal
        ranking={ranking}
        isOpen={isEditRankingOpen}
        onClose={() => setIsEditRankingOpen(false)}
      />

      <AddPlayerToRankingModal
        gameId={ranking.gameId}
        rankingId={ranking.id}
        isOpen={isAddPlayerOpen}
        onClose={() => setIsAddPlayerOpen(false)}
      />
    </div>
  );
}
