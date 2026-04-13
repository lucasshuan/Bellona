"use client";

import { useState } from "react";
import { CheckCheck, Settings2, Trophy, UserPlus } from "lucide-react";
import { ActionButton } from "@/components/ui/action-button";
import { EditGameModal } from "./edit-game-modal";
import { AddRankingModal } from "./add-ranking-modal";
import { AddPlayerModal } from "./add-player-modal";
import { type Game } from "@/server/db/schema";
import { useTranslations } from "next-intl";
import { ApproveGameModal } from "./approve-game-modal";

import { useUser } from "@/components/providers";

interface GameAdminActionsProps {
  game: Game;
}

export function GameAdminActions({ game }: GameAdminActionsProps) {
  const {
    canManageGames,
    canManagePlayers,
    canManageRankings,
    canEditGame: checkCanEditGame,
  } = useUser();

  const canEditGame = checkCanEditGame(game.authorId);
  const canApproveGame = canManageGames;

  const hasAnyAction =
    canEditGame ||
    (game.status === "pending" && canApproveGame) ||
    (game.status === "approved" && (canManageRankings || canManagePlayers));

  if (!hasAnyAction) return null;

  const t = useTranslations("Admin");
  const [isEditGameOpen, setIsEditGameOpen] = useState(false);
  const [isAddRankingOpen, setIsAddRankingOpen] = useState(false);
  const [isAddPlayerOpen, setIsAddPlayerOpen] = useState(false);
  const [isApproveOpen, setIsApproveOpen] = useState(false);

  return (
    <div className="mt-8 space-y-3">
      <div className="mb-4 flex items-center gap-3 px-1">
        <div className="h-px flex-1 bg-white/5" />
        <span className="text-[10px] font-bold tracking-[0.2em] text-white/30 uppercase">
          {t("panel")}
        </span>
        <div className="h-px flex-1 bg-white/5" />
      </div>

      {canEditGame && (
        <ActionButton
          icon={Settings2}
          label={t("editGame.trigger")}
          onClick={() => setIsEditGameOpen(true)}
        />
      )}

      {game.status === "pending" && canApproveGame && (
        <ActionButton
          icon={CheckCheck}
          intent="primary"
          label={t("approveGame.trigger")}
          onClick={() => setIsApproveOpen(true)}
        />
      )}

      {game.status === "approved" && canManageRankings && (
        <ActionButton
          icon={Trophy}
          label={t("addRanking.trigger")}
          onClick={() => setIsAddRankingOpen(true)}
        />
      )}

      {game.status === "approved" && canManagePlayers && (
        <ActionButton
          icon={UserPlus}
          label={t("addPlayer.trigger")}
          onClick={() => setIsAddPlayerOpen(true)}
        />
      )}

      {canEditGame && (
        <EditGameModal
          game={game}
          isOpen={isEditGameOpen}
          onClose={() => setIsEditGameOpen(false)}
        />
      )}

      {game.status === "approved" && canManageRankings && (
        <AddRankingModal
          gameId={game.id}
          isOpen={isAddRankingOpen}
          onClose={() => setIsAddRankingOpen(false)}
        />
      )}

      {game.status === "approved" && canManagePlayers && (
        <AddPlayerModal
          gameId={game.id}
          isOpen={isAddPlayerOpen}
          onClose={() => setIsAddPlayerOpen(false)}
        />
      )}

      {game.status === "pending" && canApproveGame && (
        <ApproveGameModal
          gameId={game.id}
          gameName={game.name}
          isOpen={isApproveOpen}
          onClose={() => setIsApproveOpen(false)}
        />
      )}
    </div>
  );
}
