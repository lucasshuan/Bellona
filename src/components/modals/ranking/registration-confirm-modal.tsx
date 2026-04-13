"use client";

import { useTransition } from "react";
import { Trophy } from "lucide-react";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { registerSelfToRanking } from "@/server/actions/game";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface RegisterConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  rankingId: string;
  initialElo: number;
}

export function RegisterConfirmModal({
  isOpen,
  onClose,
  rankingId,
  initialElo,
}: RegisterConfirmModalProps) {
  const t = useTranslations("Modals.RegisterConfirm");
  const [isPending, startTransition] = useTransition();

  const onConfirm = () => {
    startTransition(async () => {
      try {
        const result = await registerSelfToRanking(rankingId);
        if (result.success) {
          toast.success(t("success"));
          onClose();
        }
      } catch {
        toast.error("Error registering.");
      }
    });
  };

  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={t("title")}
      description={t("description", { elo: initialElo })}
      confirmText={isPending ? t("submitting") : t("submit")}
      cancelText={t("cancel")}
      isPending={isPending}
      icon={Trophy}
      variant="success"
    />
  );
}
