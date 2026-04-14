"use client";

import { LoaderCircle } from "lucide-react";
import { SiDiscord } from "react-icons/si";
import { useTranslations } from "next-intl";

import { env } from "@/env";
import { Modal } from "@/components/ui/modal";

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
  isPending: boolean;
};

export function AuthModal({ isOpen, onClose, isPending }: AuthModalProps) {
  const t = useTranslations("Modals.Auth");

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("title")}
      cancelText={t("close") || "Fechar"}
      className="max-w-sm"
    >
      <div className="space-y-3">
        <button
          onClick={() => {
            window.location.href = env.NEXT_PUBLIC_API_URL.replace(
              "/graphql",
              "/auth/discord",
            );
          }}
          disabled={isPending}
          className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-full border border-[#5865F2] bg-[#5865F2] px-6 py-3 font-medium text-white transition-all hover:bg-[#4752C4] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? (
            <LoaderCircle className="size-5 animate-spin" />
          ) : (
            <SiDiscord className="size-5" />
          )}
          {isPending ? t("signingIn") : t("continueWithDiscord")}
        </button>
      </div>
    </Modal>
  );
}
