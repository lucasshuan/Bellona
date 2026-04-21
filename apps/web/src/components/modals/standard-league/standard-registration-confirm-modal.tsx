"use client";

import { useTransition } from "react";
import { Trophy } from "lucide-react";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface StandardRegistrationConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
}

export function StandardRegistrationConfirmModal({
  isOpen,
  onClose,
}: StandardRegistrationConfirmModalProps) {
  const t = useTranslations("Modals.RegisterConfirm");
  const [isPending, startTransition] = useTransition();

  const onConfirm = () => {
    startTransition(async () => {
      // Registration is now handled via EventEntries
      toast.info("Registration via EventEntries — coming soon.");
      onClose();
    });
  };

  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={t("title")}
      description={t("descriptionStandard")}
      confirmText={isPending ? t("submitting") : t("submit")}
      cancelText={t("cancel")}
      isPending={isPending}
      icon={Trophy}
      variant="success"
    />
  );
}
