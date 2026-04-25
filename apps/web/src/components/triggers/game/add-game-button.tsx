"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useUser } from "@/components/providers";
import { useRouter } from "@/i18n/routing";
import { AuthModal } from "@/components/modals/auth/auth-modal";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AddGameButton() {
  const t = useTranslations("GamesPage");
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isPending] = useTransition();

  const handleClick = () => {
    if (isLoading) return;

    if (!user) {
      setIsAuthModalOpen(true);
    } else {
      router.push("/games/new");
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className={cn(
          buttonVariants({ intent: "primary", size: "sm" }),
          "group rounded-xl",
        )}
      >
        <Plus className="mr-1.5 size-4 transition-transform duration-300 group-hover:rotate-90" />
        {t("newGame")}
      </button>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        isPending={isPending}
      />
    </>
  );
}
