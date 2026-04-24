"use client";

import { useTranslations } from "next-intl";

interface AddPlayerToLeagueFormProps {
  leagueId: string;
  onSuccess: () => void;
  onLoadingChange?: (loading: boolean) => void;
  formId?: string;
}

export function AddPlayerToLeagueForm({}: AddPlayerToLeagueFormProps) {
  const t = useTranslations("Modals.AddPlayer");
  // Players are now managed via EventEntries.
  return (
    <div className="space-y-4">
      <p className="text-muted text-sm">{t("notAvailable")}</p>
    </div>
  );
}
