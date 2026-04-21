"use client";

import { useState } from "react";
import { Settings2, UserPlus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useUser } from "@/components/providers";
import { ActionButton } from "@/components/ui/action-button";
import { EditLeagueModal } from "@/components/modals/league/edit-league-modal";
import { AddPlayerToLeagueModal } from "@/components/modals/league/add-player-to-league-modal";

type LeagueAdminData = {
  eventId: string;
  name: string;
  slug: string;
  description?: string | null;
  classificationSystem: "ELO" | "POINTS";
  allowDraw: boolean;
  config: Record<string, unknown>;
  allowedFormats: string[];
  game: { name: string; slug: string; thumbnailImageUrl?: string | null };
};

interface LeagueAdminSectionProps {
  league: LeagueAdminData;
}

export function LeagueAdminSection({
  league,
}: LeagueAdminSectionProps) {
  const { canManageLeagues, canManagePlayers } = useUser();
  const t = useTranslations();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddPlayerOpen, setIsAddPlayerOpen] = useState(false);

  if (!canManageLeagues && !canManagePlayers) return null;

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
          onClick={() => setIsEditOpen(true)}
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
        league={league}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
      />

      <AddPlayerToLeagueModal
        leagueId={league.eventId}
        isOpen={isAddPlayerOpen}
        onClose={() => setIsAddPlayerOpen(false)}
      />
    </div>
  );
}
