"use client";

import { useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, LoaderCircle } from "lucide-react";
import { SiDiscord } from "react-icons/si";
import { useTranslations } from "next-intl";
import { env } from "@/env";

// ─── Types ────────────────────────────────────────────────────────────────────

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
  isPending: boolean;
};

// ─── Animated background orbs ────────────────────────────────────────────────

function BackgroundOrbs() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-4xl"
    >
      {/* Main crimson glow */}
      <div
        className="absolute -top-20 -left-20 size-72 rounded-full opacity-30 blur-[80px]"
        style={{
          background: "radial-gradient(circle, #c00b3b 0%, transparent 70%)",
          animation: "auth-orb-drift 8s ease-in-out infinite",
        }}
      />
      {/* Soft violet accent */}
      <div
        className="absolute -right-16 -bottom-16 size-56 rounded-full opacity-20 blur-[60px]"
        style={{
          background: "radial-gradient(circle, #8b5cf6 0%, transparent 70%)",
          animation: "auth-orb-drift 11s ease-in-out infinite reverse",
        }}
      />
      {/* Subtle top-right crimson */}
      <div
        className="absolute top-0 right-1/4 size-32 rounded-full opacity-15 blur-2xl"
        style={{
          background: "radial-gradient(circle, #c00b3b 0%, transparent 70%)",
          animation: "auth-orb-drift 6s ease-in-out infinite 2s",
        }}
      />
    </div>
  );
}

// ─── Scan-line texture ────────────────────────────────────────────────────────

function ScanLines() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 rounded-4xl opacity-[0.03]"
      style={{
        backgroundImage:
          "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.8) 2px, rgba(255,255,255,0.8) 3px)",
        backgroundSize: "100% 3px",
      }}
    />
  );
}

// // ─── Feature list item ────────────────────────────────────────────────────────

// function Feature({
//   icon: Icon,
//   label,
// }: {
//   icon: React.ElementType;
//   label: string;
// }) {
//   return (
//     <div className="flex items-center gap-2.5 text-xs text-white/40">
//       <div className="flex size-5 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5">
//         <Icon className="size-2.5 text-[#c00b3b]" />
//       </div>
//       {label}
//     </div>
//   );
// }

// ─── Main modal ───────────────────────────────────────────────────────────────

function AuthModalInner({
  onClose,
  isPending,
}: Omit<AuthModalProps, "isOpen">) {
  const t = useTranslations("Modals.Auth");
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const handleDiscord = useCallback(() => {
    window.location.href = env.NEXT_PUBLIC_API_URL.replace(
      "/graphql",
      "/auth/discord",
    );
  }, []);

  // Close on backdrop click
  const handleOverlayClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === overlayRef.current) onClose();
    },
    [onClose],
  );

  // Escape key
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

  // Entrance animation trigger
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    panel.style.opacity = "0";
    panel.style.transform = "scale(0.9) translateY(16px)";
    requestAnimationFrame(() => {
      panel.style.transition =
        "opacity 280ms cubic-bezier(0.22,1,0.36,1), transform 280ms cubic-bezier(0.22,1,0.36,1)";
      panel.style.opacity = "1";
      panel.style.transform = "scale(1) translateY(0)";
    });
  }, []);

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-200 flex items-center justify-center p-4"
      style={{ background: "rgba(5,3,8,0.75)", backdropFilter: "blur(12px)" }}
    >
      {/* Panel */}
      <div
        ref={panelRef}
        className="relative w-full max-w-[400px] overflow-hidden rounded-4xl"
        style={{
          background:
            "linear-gradient(160deg, rgb(18 10 22 / 0.98), rgb(10 6 14 / 0.98))",
          boxShadow:
            "0 0 0 1px rgba(192,11,59,0.18), 0 0 0 1px rgba(255,255,255,0.04) inset, 0 32px 80px rgba(0,0,0,0.7), 0 0 60px rgba(192,11,59,0.12)",
        }}
      >
        <BackgroundOrbs />
        <ScanLines />

        {/* Top border accent */}
        <div
          aria-hidden="true"
          className="absolute top-0 left-1/2 h-px w-3/4 -translate-x-1/2"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(192,11,59,0.7), rgba(231,215,243,0.3), rgba(192,11,59,0.7), transparent)",
          }}
        />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 flex size-8 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/40 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white"
          aria-label="Fechar"
        >
          <X className="size-4" />
        </button>

        {/* Content */}
        <div className="relative px-8 pt-10 pb-8">
          {/* Logo / Icon area */}
          <div className="mb-8 flex flex-col items-center gap-5">
            {/* Icon medallion */}
            <div className="relative">
              <div
                className="rounded-2 absolute inset-0 blur-xl"
                style={{ background: "rgba(192,11,59,0.2)" }}
              />
              <div
                className="bg-primary size-14 shrink-0 sm:size-16 lg:size-14"
                style={{
                  maskImage: `url(/icon.svg)`,
                  WebkitMaskImage: `url(/icon.svg)`,
                  maskSize: "contain",
                  WebkitMaskSize: "contain",
                  maskRepeat: "no-repeat",
                  WebkitMaskRepeat: "no-repeat",
                  maskPosition: "center",
                  WebkitMaskPosition: "center",
                }}
                aria-label="Ares icon"
                role="img"
              />
            </div>

            {/* Wordmark */}
            <div className="space-y-1 text-center">
              <h2 className="text-2xl font-black tracking-tight text-white">
                {t("title1")}{" "}
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage:
                      "linear-gradient(135deg, #f7f0f3, #c00b3b)",
                  }}
                >
                  {t("title2")}
                </span>
              </h2>
              <p className="text-sm leading-5 text-white/40">{t("title")}</p>
            </div>
          </div>

          {/* Divider with label */}
          <div className="mb-5 flex items-center gap-3">
            <div
              className="h-px flex-1"
              style={{ background: "rgba(255,255,255,0.06)" }}
            />
            <span className="text-[10px] font-medium tracking-widest text-white/25 uppercase">
              Continuar com
            </span>
            <div
              className="h-px flex-1"
              style={{ background: "rgba(255,255,255,0.06)" }}
            />
          </div>

          {/* Discord button */}
          <button
            onClick={handleDiscord}
            disabled={isPending}
            className="group relative w-full overflow-hidden rounded-2xl font-semibold text-white transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              background: "linear-gradient(135deg, #5865F2, #4752C4)",
              boxShadow:
                "0 4px 24px rgba(88,101,242,0.35), inset 0 1px 0 rgba(255,255,255,0.12)",
              padding: "14px 20px",
            }}
          >
            {/* Hover shimmer */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.06), transparent 60%)",
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
          <p className="mt-6 text-center text-[10px] leading-5 text-white/20">
            Ao entrar, você concorda com os nossos termos de uso e política de
            privacidade da plataforma Ares.
          </p>
        </div>

        {/* Bottom border accent */}
        <div
          aria-hidden="true"
          className="absolute bottom-0 left-1/2 h-px w-1/2 -translate-x-1/2"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(192,11,59,0.35), transparent)",
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
