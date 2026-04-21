"use client";

import { useState } from "react";
import { Trophy, CheckCircle2 } from "lucide-react";
import { PrimaryAction } from "@/components/ui/primary-action";
import { useTranslations } from "next-intl";
import { SignInButton } from "@/components/triggers/auth/sign-in-button";
import { StandardRegistrationConfirmModal } from "@/components/modals/standard-league/standard-registration-confirm-modal";

interface StandardLeagueRegistrationTriggerProps {
  eventId: string;
  isRegistered: boolean;
  isLoggedIn: boolean;
}

export function StandardLeagueRegistrationTrigger({
  eventId,
  isRegistered,
  isLoggedIn,
}: StandardLeagueRegistrationTriggerProps) {
  const t = useTranslations("League");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  if (isRegistered) {
    return (
      <PrimaryAction
        variant="primary"
        icon={CheckCircle2}
        label={t("alreadyRegistered")}
        className="mt-4"
        disabled={true}
      />
    );
  }

  if (!isLoggedIn) {
    return (
      <SignInButton
        label={t("loginToRegister")}
        className="mt-4 w-full"
        size="lg"
        intent="primary"
      />
    );
  }

  return (
    <>
      <PrimaryAction
        variant="red"
        icon={Trophy}
        label={t("register")}
        className="mt-4"
        onClick={() => setIsConfirmOpen(true)}
      />
      <StandardRegistrationConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        eventId={eventId}
      />
    </>
  );
}
