"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AddGameModal } from "./add-game-modal";

import { useUser } from "@/components/providers";

export function AddGameTrigger() {
  const { user, canManageGames } = useUser();
  const isLoggedIn = !!user;
  const t = useTranslations("GamesPage.addGame");
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={cn(
          buttonVariants({ intent: "secondary", size: "md" }),
          "group w-full justify-center rounded-2xl px-5 sm:w-auto",
        )}
      >
        <Plus className="mr-2 size-4 transition-transform duration-500 group-hover:rotate-90" />
        {t("trigger")}
      </button>

      <AddGameModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
