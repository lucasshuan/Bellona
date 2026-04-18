"use client";

import { useState } from "react";
import { CheckCheck, ChevronDown, Settings2 } from "lucide-react";
import { type Game } from "@/lib/apollo/generated/graphql";
import { useTranslations } from "next-intl";
import { DropdownItem, DropdownMenu } from "@/components/ui/dropdown-menu";
import { EditGameModal } from "@/components/modals/game/edit-game-modal";
import { ApproveGameModal } from "@/components/modals/game/approve-game-modal";

interface PageAdminActionsProps {
  game: Game;
  canEditGame: boolean;
  canApproveGame: boolean;
  canManagePlayers: boolean;
}

export function PageAdminActions({
  game,
  canEditGame,
  canApproveGame,
  canManagePlayers,
}: PageAdminActionsProps) {
  const t = useTranslations();
  const [isEditGameOpen, setIsEditGameOpen] = useState(false);
  const [isApproveOpen, setIsApproveOpen] = useState(false);

  return (
    <>
      <DropdownMenu
        align="end"
        width={280}
        trigger={
          <div className="border-glow-animation rounded-2xl p-px transition-transform hover:-translate-y-0.5">
            <button
              type="button"
              className="flex h-11 items-center gap-2 rounded-[15px] bg-[#0e0a12] px-4 text-xs font-bold tracking-wider text-white/80 uppercase transition-colors hover:translate-y-0 hover:bg-[#130e18]"
            >
              <Settings2 className="size-4" />
              <span>{t("Admin.panel")}</span>
              <ChevronDown className="size-4 text-white/50" />
            </button>
          </div>
        }
      >
        {canEditGame && (
          <DropdownItem
            icon={Settings2}
            onClick={() => setIsEditGameOpen(true)}
          >
            {t("Modals.EditGame.trigger")}
          </DropdownItem>
        )}

        {game.status === "PENDING" && canApproveGame && (
          <DropdownItem
            icon={CheckCheck}
            onClick={() => setIsApproveOpen(true)}
          >
            {t("Modals.ApproveGame.trigger")}
          </DropdownItem>
        )}
      </DropdownMenu>

      {canEditGame && (
        <EditGameModal
          game={game}
          isOpen={isEditGameOpen}
          onClose={() => setIsEditGameOpen(false)}
        />
      )}

      {game.status === "PENDING" && canApproveGame && (
        <ApproveGameModal
          gameId={game.id}
          gameName={game.name}
          isOpen={isApproveOpen}
          onClose={() => setIsApproveOpen(false)}
        />
      )}
    </>
  );
}
