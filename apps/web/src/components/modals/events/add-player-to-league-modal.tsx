"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { useTranslations } from "next-intl";
import { AddPlayerToLeagueForm } from "@/components/forms/events/add-player-to-league-form";

interface AddPlayerToLeagueModalProps {
  leagueId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function AddPlayerToLeagueModal({
  leagueId,
  isOpen,
  onClose,
}: AddPlayerToLeagueModalProps) {
  const t = useTranslations("Modals.AddPlayerToLeague");
  const [isPending, setIsPending] = useState(false);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("title")}
      description={t("description")}
      cancelText={t("cancel")}
      isPending={isPending}
    >
      <AddPlayerToLeagueForm
        leagueId={leagueId}
        onSuccess={onClose}
        onLoadingChange={setIsPending}
      />
    </Modal>
  );
}
