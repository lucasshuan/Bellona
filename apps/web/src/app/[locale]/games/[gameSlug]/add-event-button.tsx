"use client";

import { useState, useTransition } from "react";
import { Trophy, Swords, ChevronRight, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useUser } from "@/components/providers";
import { AddLeagueModal } from "@/components/modals/league/add-league-modal";
import { AuthModal } from "@/components/modals/auth/auth-modal";
import { DropdownMenu, DropdownItem } from "@/components/ui/dropdown-menu";
import type { SimpleGame } from "@/actions/get-games";

interface AddEventButtonProps {
  gameId: string;
  game?: SimpleGame;
  variant?: "sidebar" | "header";
}

export function AddEventButton({
  gameId,
  game,
  variant = "sidebar",
}: AddEventButtonProps) {
  const t = useTranslations("Modals.AddLeague");
  const { user, isLoading } = useUser();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAddLeagueOpen, setIsAddLeagueOpen] = useState(false);
  const [isPending] = useTransition();

  const handleTriggerClick = () => {
    if (isLoading) return;

    if (!user) {
      setIsAuthModalOpen(true);
    }
  };

  const menuButton =
    variant === "sidebar" ? (
      <button
        onClick={handleTriggerClick}
        className="group hover:border-primary/30 relative flex w-full items-center gap-4 overflow-hidden rounded-3xl border border-white/5 bg-white/5 p-4 transition-all hover:bg-white/10 active:scale-[0.98]"
      >
        <div className="bg-primary/10 text-primary group-hover:bg-primary/20 flex size-12 items-center justify-center rounded-2xl transition-colors">
          <Trophy className="size-6" />
        </div>
        <div className="flex flex-col text-left">
          <span className="text-sm font-bold whitespace-nowrap text-white">
            {t("trigger")}
          </span>
          <span className="text-muted text-xs opacity-60">
            {t("description")}
          </span>
        </div>
        <ChevronRight className="group-hover:text-primary ml-auto size-5 text-white/20 transition-transform group-hover:translate-x-1" />

        {/* Glow effect */}
        <div className="bg-primary/5 absolute -right-4 -bottom-4 size-24 rounded-full opacity-0 blur-2xl transition-opacity group-hover:opacity-100" />
      </button>
    ) : (
      <button
        onClick={handleTriggerClick}
        className="bg-primary/10 text-primary hover:bg-primary/20 hover:ring-primary/10 flex h-11 items-center gap-2 rounded-2xl px-5 text-xs font-bold tracking-wider uppercase transition-all hover:ring-4 active:scale-95"
      >
        <Plus className="size-4" />
        {variant === "header" ? t("headerTrigger") : t("trigger")}
      </button>
    );

  return (
    <>
      {user ? (
        <DropdownMenu
          trigger={menuButton}
          side={variant === "sidebar" ? "right" : "bottom"}
          align={variant === "header" ? "end" : "center"}
          width={300}
        >
          <DropdownItem icon={Trophy} onClick={() => setIsAddLeagueOpen(true)}>
            {t("types.league")}
          </DropdownItem>
          <DropdownItem
            icon={Swords}
            className="cursor-not-allowed opacity-50"
            onClick={() => {
              // Tournament system not implemented yet
            }}
          >
            <div className="flex flex-1 items-center justify-between gap-6 whitespace-nowrap">
              <span className="font-semibold">{t("types.tournament")}</span>
              <span className="text-[9px] font-bold tracking-[0.2em] text-white/20 uppercase">
                {t("soon")}
              </span>
            </div>
          </DropdownItem>
        </DropdownMenu>
      ) : (
        menuButton
      )}

      <AddLeagueModal
        gameId={gameId}
        initialGame={game}
        isGameFixed={true}
        isOpen={isAddLeagueOpen}
        onClose={() => setIsAddLeagueOpen(false)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        isPending={isPending}
      />
    </>
  );
}
