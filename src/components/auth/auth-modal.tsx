"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { signIn } from "next-auth/react";
import { LoaderCircle, X } from "lucide-react";
import { SiDiscord } from "react-icons/si";
import { useTranslations } from "next-intl";

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
  isPending: boolean;
};

export function AuthModal({ isOpen, onClose, isPending }: AuthModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("AuthModal");

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === modalRef.current) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      ref={modalRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
    >
      <div className="glass-panel animate-in fade-in-0 zoom-in-95 mx-4 w-full max-w-sm rounded-4xl p-8 duration-200">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-[-0.04em]">
              {t("title")}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer rounded-full p-2 transition-colors hover:bg-white/8"
            aria-label={t("close")}
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => signIn("discord", { callbackUrl: "/profile" })}
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
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
