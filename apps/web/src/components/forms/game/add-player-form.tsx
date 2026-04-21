"use client";

import { useTranslations } from "next-intl";

interface AddPlayerFormProps {
  gameId: string;
  onSuccess: () => void;
  onLoadingChange?: (loading: boolean) => void;
  onValidationChange?: (isValid: boolean) => void;
  formId: string;
}

export function AddPlayerForm({
  formId,
  onValidationChange,
}: AddPlayerFormProps) {
  const t = useTranslations("Modals.AddPlayer");
  // Players are now managed via EventEntries. This form is a stub.
  return (
    <form id={formId} className="space-y-4">
      <p className="text-muted text-sm">{t("notAvailable")}</p>
    </form>
  );
}
