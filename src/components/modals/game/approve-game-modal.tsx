"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { CheckCheck, AlertTriangle } from "lucide-react";

import { Modal } from "@/components/ui/modal";
import { ActionButton } from "@/components/ui/action-button";
import { approveGame } from "@/server/actions/game";

interface ApproveGameModalProps {
  gameId: string;
  gameName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ApproveGameModal({
  gameId,
  gameName,
  isOpen,
  onClose,
}: ApproveGameModalProps) {
  const t = useTranslations("Modals.ApproveGame");
  const [isPending, startTransition] = useTransition();

  const handleApprove = () => {
    startTransition(async () => {
      try {
        await approveGame(gameId);
        toast.success(t("success"));
        onClose();
      } catch {
        toast.error(t("error"));
      }
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("title")}
      confirmText={isPending ? t("submitting") : t("submit")}
      cancelText={t("cancel")}
      onConfirm={handleApprove}
      isPending={isPending}
      confirmIcon={CheckCheck}
    >
      <div className="space-y-6 pt-4">
        <div className="flex items-center gap-4 rounded-2xl border border-orange-500/20 bg-orange-500/5 p-4 text-orange-200/80">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400">
            <AlertTriangle className="size-5" />
          </div>
          <p className="text-sm leading-relaxed">
            {t("description", { gameName })}
          </p>
        </div>
      </div>
    </Modal>
  );
}
