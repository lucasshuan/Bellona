"use client";

import { useState, useTransition } from "react";
import { Trophy, ChevronRight, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useUser } from "@/components/providers";
import { AddEventModal } from "@/components/modals/events/add-event-modal";
import { AuthModal } from "@/components/modals/auth/auth-modal";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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
  const t = useTranslations("Modals.AddEvent");
  const { user, isLoading } = useUser();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAddLeagueOpen, setIsAddLeagueOpen] = useState(false);
  const [isPending] = useTransition();

  const handleTriggerClick = () => {
    if (isLoading) return;

    if (!user) {
      setIsAuthModalOpen(true);
    } else {
      setIsAddLeagueOpen(true);
    }
  };

  const menuButton =
    variant === "sidebar" ? (
      <button
        onClick={handleTriggerClick}
        className="group hover:border-primary/50 hover:bg-primary/12 relative flex w-full items-center gap-4 overflow-hidden rounded-2xl border border-white/5 bg-white/8 p-4 transition-all active:scale-[0.98]"
      >
        <div className="bg-primary/10 text-primary group-hover:bg-primary/20 flex size-12 items-center justify-center rounded-2xl transition-colors">
          <Trophy className="size-6" />
        </div>
        <div className="flex flex-col text-left">
          <span className="text-sm font-bold whitespace-nowrap text-white/90">
            {t("trigger")}
          </span>
          <span className="text-muted text-xs opacity-60">
            {t("description")}
          </span>
        </div>
        <ChevronRight className="group-hover:text-primary ml-auto size-5 text-white/20 transition-transform group-hover:translate-x-1" />
      </button>
    ) : (
      <button
        onClick={handleTriggerClick}
        className={cn(
          buttonVariants({ intent: "primary" }),
          "gap-2 rounded-2xl px-5 text-xs font-bold tracking-wider uppercase",
        )}
      >
        <Plus className="size-4" />
        {variant === "header" ? t("headerTrigger") : t("trigger")}
      </button>
    );

  return (
    <>
      {menuButton}

      <AddEventModal
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
