"use client";

import { useEffect, useRef, type ElementType } from "react";
import { createPortal } from "react-dom";
import { X, LoaderCircle, Save, ArrowRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

export interface Step {
  label: string;
  icon?: ElementType;
}

interface MultiStepModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  steps: Step[];
  currentStep: number;
  onNext: () => void;
  onBack: () => void;
  onStepClick?: (step: number) => void;
  isStepUnlocked?: (step: number) => boolean;
  onConfirm?: () => void;
  children: React.ReactNode;
  className?: string;
  isPending?: boolean;
  disabledNext?: boolean;
  formId?: string;
  confirmText?: string;
  nextText?: string;
  backText?: string;
  cancelText?: string;
  submitOnConfirm?: boolean;
}

export function MultiStepModal({
  isOpen,
  onClose,
  title,
  description,
  steps,
  currentStep,
  onNext,
  onBack,
  onStepClick,
  isStepUnlocked,
  onConfirm,
  children,
  className = "sm:max-w-2xl lg:max-w-4xl xl:max-w-5xl",
  isPending,
  disabledNext,
  formId,
  confirmText = "Confirm",
  nextText = "Next",
  backText = "Back",
  cancelText = "Cancel",
  submitOnConfirm = true,
}: MultiStepModalProps) {
  const modalContainerRef = useRef<HTMLDivElement>(null);
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === modalContainerRef.current) onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      ref={modalContainerRef}
      onClick={handleBackdropClick}
      className="animate-modal-overlay fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-4 will-change-[opacity,backdrop-filter]"
    >
      <div
        className={cn(
          "glass-panel animate-modal-content flex max-h-[95dvh] w-full flex-col overflow-hidden rounded-4xl bg-[#0a080f] will-change-[transform,opacity]",
          className,
        )}
      >
        {/* Header - Fixed */}
        <div className="flex shrink-0 flex-col border-b border-white/5 p-6 lg:px-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white">
                {title}
              </h2>
              {description && (
                <p className="text-muted mt-1 text-sm">{description}</p>
              )}
            </div>
            <button
              onClick={onClose}
              type="button"
              className="cursor-pointer rounded-full p-2 text-white/70 transition-colors hover:bg-white/10"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Steps Indicator */}
          <div className="custom-scrollbar flex items-center gap-2 overflow-x-auto py-1">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isActive = idx === currentStep;
              const isPast = idx < currentStep;
              const isUnlocked = isStepUnlocked?.(idx) ?? false;
              const canClick =
                onStepClick && (isPast || isUnlocked) && !isActive;

              return (
                <div key={idx} className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => canClick && onStepClick(idx)}
                    disabled={!canClick}
                    className={cn(
                      "flex items-center gap-2 rounded-2xl border px-4 py-2 transition-all duration-300",
                      isActive
                        ? "border-primary/50 bg-primary/10 text-primary shadow-primary/10 shadow-lg"
                        : isPast || isUnlocked
                          ? "cursor-pointer border-success/20 bg-success/5 text-success/70 hover:bg-success/10"
                          : "cursor-not-allowed border-white/5 bg-white/5 text-white/30",
                    )}
                  >
                    <div
                      className={cn(
                        "flex size-5 items-center justify-center rounded-full text-[10px] font-bold",
                        isActive
                          ? "bg-primary text-white"
                          : isPast || isUnlocked
                            ? "bg-success text-white"
                            : "bg-white/10 text-white/40",
                      )}
                    >
                      {idx + 1}
                    </div>
                    {Icon && <Icon className="size-3.5" />}
                    <span className="text-xs font-bold tracking-wide uppercase">
                      {step.label}
                    </span>
                  </button>
                  {idx < steps.length - 1 && (
                    <div
                      className={cn(
                        "h-px w-6",
                        isPast || isUnlocked
                          ? "bg-success/20"
                          : "bg-white/5",
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="custom-scrollbar relative flex-1 overflow-y-auto p-6 lg:px-8">
          <div className="animate-in">{children}</div>
        </div>

        {/* Footer - Fixed */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-white/5 bg-white/2 p-6 lg:px-8">
          <div>
            {!isFirstStep && (
              <Button
                type="button"
                intent="ghost"
                onClick={onBack}
                disabled={isPending}
                className="rounded-2xl px-6"
              >
                <ArrowLeft className="mr-2 size-4 opacity-70" />
                {backText}
              </Button>
            )}
            {isFirstStep && (
              <Button
                type="button"
                intent="ghost"
                onClick={onClose}
                disabled={isPending}
                className="rounded-2xl px-6 text-white/40 hover:text-white"
              >
                {cancelText}
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {!isLastStep ? (
              <Button
                key="next-step"
                type="button"
                onClick={onNext}
                disabled={disabledNext || isPending}
                intent="primary"
                className="rounded-2xl px-8"
              >
                {nextText}
                <ArrowRight className="ml-2 size-4" />
              </Button>
            ) : (
              <Button
                key="confirm-step"
                type={formId && submitOnConfirm ? "submit" : "button"}
                form={submitOnConfirm ? formId : undefined}
                onClick={onConfirm}
                disabled={disabledNext || isPending}
                intent="primary"
                className="rounded-2xl px-8"
              >
                {isPending ? (
                  <LoaderCircle className="mr-2 size-4 animate-spin" />
                ) : (
                  <Save className="mr-2 size-4" />
                )}
                {confirmText}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
