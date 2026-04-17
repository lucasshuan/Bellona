"use client";

import { useState, useEffect, useRef } from "react";
import { MultiStepModal } from "@/components/ui/multi-step-modal";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { AddLeagueForm } from "@/components/forms/league/add-league-form";
import { useLocale, useTranslations } from "next-intl";
import type { SimpleGame } from "@/actions/get-games";
import { Trophy } from "lucide-react";

interface AddLeagueModalProps {
  gameId: string;
  initialGame?: SimpleGame;
  isOpen: boolean;
  onClose: () => void;
  isGameFixed?: boolean;
}

export function AddLeagueModal({
  gameId,
  initialGame,
  isOpen,
  onClose,
  isGameFixed,
}: AddLeagueModalProps) {
  const t = useTranslations("Modals.AddLeague");
  const locale = useLocale();
  const confirmFallbacks =
    locale === "pt"
      ? {
          title: "Confirmar Criação",
          description: "Deseja criar esta liga com as configurações definidas?",
          submit: "Confirmar Criação",
          cancel: "Cancelar",
        }
      : {
          title: "Confirm Creation",
          description:
            "Do you want to create this league with the current settings?",
          submit: "Confirm Creation",
          cancel: "Cancel",
        };

  const getConfirmText = (
    key: "title" | "description" | "submit" | "cancel",
  ) => {
    try {
      return t(`confirm.${key}`);
    } catch {
      return confirmFallbacks[key];
    }
  };

  // States
  const [currentStep, setCurrentStep] = useState(gameId ? 1 : 0);
  const [isLoading, setIsLoading] = useState(false);
  const [isStepValid, setIsStepValid] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  if (isOpen && !prevIsOpen) {
    setPrevIsOpen(true);
    setCurrentStep(gameId ? 1 : 0);
  } else if (!isOpen && prevIsOpen) {
    setPrevIsOpen(false);
  }

  const isMounted = useRef(true);

  // Track mount status to avoid state updates on unmounted components
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const steps = [
    { label: t("steps.game") },
    { label: t("steps.general") },
    { label: t("steps.format") },
  ];

  const handleClose = () => {
    setIsConfirmOpen(false);
    onClose();
    // Delay state reset to allow for closing animations
    setTimeout(() => {
      if (isMounted.current) {
        setCurrentStep(0);
        setIsLoading(false);
      }
    }, 300);
  };

  const handleOpenConfirm = () => {
    setIsConfirmOpen(true);
  };

  const handleConfirmCreate = () => {
    const form = document.getElementById("add-league-form");
    if (form instanceof HTMLFormElement) {
      form.requestSubmit();
    }
  };

  return (
    <>
      <MultiStepModal
        isOpen={isOpen}
        title={t("title")}
        description={t("description")}
        onClose={handleClose}
        onNext={() => setCurrentStep((s) => s + 1)}
        onBack={() => setCurrentStep((s) => s - 1)}
        onConfirm={handleOpenConfirm}
        steps={steps}
        currentStep={currentStep}
        formId="add-league-form"
        isPending={isLoading}
        disabledNext={!isStepValid}
        nextText={t("next")}
        backText={t("back")}
        confirmText={t("submit")}
        submitOnConfirm={false}
      >
        <AddLeagueForm
          formId="add-league-form"
          gameId={gameId}
          initialGame={initialGame}
          isGameFixed={isGameFixed}
          currentStep={currentStep}
          onSuccess={handleClose}
          onLoadingChange={setIsLoading}
          onStepValidationChange={setIsStepValid}
        />
      </MultiStepModal>

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmCreate}
        title={getConfirmText("title")}
        description={getConfirmText("description")}
        confirmText={isLoading ? t("submitting") : getConfirmText("submit")}
        cancelText={getConfirmText("cancel")}
        isPending={isLoading}
        icon={Trophy}
        variant="success"
      />
    </>
  );
}
