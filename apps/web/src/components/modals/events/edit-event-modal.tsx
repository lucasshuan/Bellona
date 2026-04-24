"use client";

import { useEffect, useRef, useState } from "react";
import { MultiStepModal } from "@/components/ui/multi-step-modal";
import { useTranslations } from "next-intl";
import { EditEventForm } from "@/components/forms/events/edit-event-form";

type LeagueForEdit = {
  eventId: string;
  name: string;
  slug: string;
  description?: string | null;
  about?: string | null;
  classificationSystem: "ELO" | "POINTS";
  allowDraw: boolean;
  config: Record<string, unknown>;
  allowedFormats: string[];
  game: {
    name: string;
    slug: string;
    thumbnailImageUrl?: string | null;
    description?: string | null;
  };
};

interface EditEventModalProps {
  league: LeagueForEdit;
  isOpen: boolean;
  onClose: () => void;
}

export function EditEventModal({
  league,
  isOpen,
  onClose,
}: EditEventModalProps) {
  const t = useTranslations("Modals.EditLeague");
  const [isPending, setIsPending] = useState(false);
  const [isValid, setIsValid] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [isStepValid, setIsStepValid] = useState(true);

  const maxReachedStepRef = useRef(0);

  const handleClose = () => {
    setCurrentStep(0);
    setIsStepValid(true);
    setIsValid(true);
    maxReachedStepRef.current = 0;
    onClose();
  };

  useEffect(() => {
    if (currentStep > maxReachedStepRef.current) {
      maxReachedStepRef.current = currentStep;
    }
  }, [currentStep]);

  const steps = [
    { label: t("steps.game") },
    { label: t("steps.format") },
    { label: t("steps.general") },
    { label: t("steps.matchFormats") },
  ];

  const isStepUnlocked = (step: number) => {
    if (step <= currentStep) return true;
    return step <= maxReachedStepRef.current && isStepValid;
  };

  return (
    <MultiStepModal
      isOpen={isOpen}
      onClose={handleClose}
      title={t("title")}
      description={t("description")}
      steps={steps}
      currentStep={currentStep}
      onNext={() => setCurrentStep((s) => s + 1)}
      onBack={() => setCurrentStep((s) => s - 1)}
      onStepClick={setCurrentStep}
      isStepUnlocked={isStepUnlocked}
      confirmText={isPending ? t("submitting") : t("submit")}
      nextText={t("next")}
      backText={t("back")}
      cancelText={t("cancel")}
      formId="edit-event-form"
      isPending={isPending}
      disabledNext={!isStepValid || !isValid}
      className="max-w-3xl"
    >
      <EditEventForm
        league={league}
        onSuccess={handleClose}
        onLoadingChange={setIsPending}
        onValidationChange={setIsValid}
        onStepValidationChange={setIsStepValid}
        currentStep={currentStep}
        formId="edit-event-form"
      />
    </MultiStepModal>
  );
}
