"use client";

import { useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, LoaderCircle } from "lucide-react";
import { SiDiscord } from "react-icons/si";
import { useTranslations } from "next-intl";
import Image from "next/image";

import { getApiUrl } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
  isPending: boolean;
};

// ─── Scan-line texture ────────────────────────────────────────────────────────

function ScanLines() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 rounded-3xl opacity-[0.025]"
      style={{
        backgroundImage:
          "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.8) 2px, rgba(255,255,255,0.8) 3px)",
        backgroundSize: "100% 3px",
      }}
    />
  );
}

// ─── Main modal ───────────────────────────────────────────────────────────────

function AuthModalInner({ onClose, isPending }: Omit<AuthModalProps, "isOpen">) {
  const t = useTranslations("Modals.Auth");

  const handleDiscord = useCallback(() => {
    window.location.href = getApiUrl("/auth/discord");
  }, []);

  // Escape key + scroll lock
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="animate-modal-overlay fixed inset-0 z-200 flex items-center justify-center p-4 bg-black/70 will-change-[opacity,backdrop-filter]"
    >
      {/* Panel */}
      <div
        className="animate-modal-content relative w-full max-w-96 overflow-hidden rounded-3xl will-change-[transform,opacity]"
        style={{
          background:
            "linear-gradient(160deg, var(--card-strong) 0%, var(--background) 100%)",
          boxShadow:
            "0 0 0 1px color-mix(in srgb, var(--primary) 22%, transparent), 0 0 0 1px color-mix(in srgb, white 4%, transparent) inset, 0 32px 80px rgb(0 0 0 / 0.75), 0 0 70px color-mix(in srgb, var(--primary) 10%, transparent)",
        }}
      >
        <ScanLines />

        {/* Ambient glow blob behind logo */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-48 w-64 -translate-y-1/3 rounded-full blur-3xl"
          style={{ background: "color-mix(in srgb, var(--primary) 14%, transparent)" }}
        />

        {/* Top border accent */}
        <div
          aria-hidden="true"
          className="absolute top-0 left-1/2 h-px w-3/4 -translate-x-1/2"
          style={{
            background:
              "linear-gradient(90deg, transparent, color-mix(in srgb, var(--primary) 90%, transparent), color-mix(in srgb, var(--gold) 50%, transparent), color-mix(in srgb, var(--primary) 90%, transparent), transparent)",
          }}
        />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 cursor-pointer rounded-xl p-2 text-foreground/30 transition-colors hover:bg-white/8 hover:text-foreground"
          aria-label={t("close")}
        >
          <X className="size-4" />
        </button>

        {/* Content */}
        <div className="relative px-8 pt-10 pb-8">
          {/* Logo / Icon area */}
          <div className="mb-8 flex flex-col items-center gap-5">
            {/* Logo with glow ring */}
            <div className="relative flex items-center justify-center">
              <div
                aria-hidden="true"
                className="absolute inset-0 rounded-full blur-2xl"
                style={{ background: "color-mix(in srgb, var(--primary) 20%, transparent)" }}
              />
              <Image
                src="/logo2.png"
                alt="Bellona"
                width={120}
                height={120}
                className="relative size-30 object-contain drop-shadow-lg"
              />
            </div>

            {/* Wordmark */}
            <div className="space-y-1 text-center">
              <h2 className="text-2xl font-black tracking-tight text-foreground">
                {t("title1")}{" "}
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage:
                      "linear-gradient(135deg, var(--secondary), var(--primary))",
                  }}
                >
                  {t("title2")}
                </span>
              </h2>
              <p className="text-muted text-sm leading-5">{t("title")}</p>
            </div>
          </div>

          {/* Divider with label */}
          <div className="mb-5 flex items-center gap-3">
            <div
              className="h-px flex-1"
              style={{ background: "color-mix(in srgb, var(--gold-dim) 30%, transparent)" }}
            />
            <span className="text-[10px] font-medium tracking-widest text-muted/50 uppercase">
              {t("continueWith")}
            </span>
            <div
              className="h-px flex-1"
              style={{ background: "color-mix(in srgb, var(--gold-dim) 30%, transparent)" }}
            />
          </div>

          {/* Discord button */}
          <button
            onClick={handleDiscord}
            disabled={isPending}
            className="group relative w-full overflow-hidden rounded-2xl bg-discord px-5 py-3.5 font-semibold text-white transition-all duration-200 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              boxShadow:
                "0 4px 24px color-mix(in srgb, var(--discord) 35%, transparent), inset 0 1px 0 color-mix(in srgb, white 12%, transparent)",
            }}
          >
            {/* Hover shimmer */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{
                background:
                  "linear-gradient(135deg, color-mix(in srgb, white 8%, transparent), transparent 60%)",
              }}
            />
            <div className="relative flex items-center justify-center gap-3">
              {isPending ? (
                <LoaderCircle className="size-5 animate-spin" />
              ) : (
                <SiDiscord className="size-5" />
              )}
              <span className="text-sm">
                {isPending ? t("signingIn") : t("continueWithDiscord")}
              </span>
            </div>
          </button>

          {/* Footer note */}
          <p className="mt-6 text-center text-[10px] leading-5 text-muted/40">
            {t("termsNotice")}
          </p>
        </div>

        {/* Bottom border accent */}
        <div
          aria-hidden="true"
          className="absolute bottom-0 left-1/2 h-px w-1/2 -translate-x-1/2"
          style={{
            background:
              "linear-gradient(90deg, transparent, color-mix(in srgb, var(--primary) 55%, transparent), transparent)",
          }}
        />
      </div>
    </div>
  );
}

// ─── Portal wrapper ───────────────────────────────────────────────────────────

export function AuthModal({ isOpen, onClose, isPending }: AuthModalProps) {
  if (!isOpen) return null;

  if (typeof document === "undefined") return null;

  return createPortal(
    <AuthModalInner onClose={onClose} isPending={isPending} />,
    document.body,
  );
}
