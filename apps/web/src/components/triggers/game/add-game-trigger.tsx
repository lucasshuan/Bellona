"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";

import { AuthModal } from "@/components/modals/auth/auth-modal";
import { buttonVariants } from "@/components/ui/button";
import { useUser } from "@/components/providers";
import { cn } from "@/lib/utils";
import { AddGameModal } from "@/components/modals/game/add-game-modal";

export function AddGameTrigger({ isAdmin = false }: { isAdmin?: boolean }) {
  const t = useTranslations("Modals.AddGame");
  const { user, isLoading } = useUser();
  const [isAddGameModalOpen, setIsAddGameModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleClick = () => {
    if (isLoading) {
      return;
    }

    if (user) {
      setIsAddGameModalOpen(true);
      return;
    }

    setIsAuthModalOpen(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={isLoading}
        className={cn(
          buttonVariants({ intent: "secondary", size: "md" }),
          "group w-full justify-center rounded-2xl px-5 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto",
        )}
      >
        <Plus className="mr-2 size-4 transition-transform duration-500 group-hover:rotate-90" />
        {t(isAdmin ? "triggerAdmin" : "trigger")}
      </button>

      <AddGameModal
        isOpen={isAddGameModalOpen}
        onClose={() => setIsAddGameModalOpen(false)}
      />
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        isPending={false}
      />
    </>
  );
}
