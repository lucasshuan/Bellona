"use client";

import { type ElementType } from "react";
import { Modal } from "./modal";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, HelpCircle, Info } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  isPending?: boolean;
  variant?: "info" | "danger" | "success" | "warning";
  icon?: ElementType;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  children,
  confirmText,
  cancelText,
  isPending,
  variant = "info",
  icon: CustomIcon,
}: ConfirmModalProps) {
  const Icon = CustomIcon ?? {
    info: Info,
    danger: AlertCircle,
    success: CheckCircle2,
    warning: HelpCircle,
  }[variant];

  const intent = {
    info: "primary",
    danger: "danger",
    success: "primary",
    warning: "secondary",
  }[variant] as any;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={title}
      confirmText={confirmText}
      cancelText={cancelText}
      isPending={isPending}
      confirmIntent={intent}
      confirmIcon={Icon}
      showHeader={false}
      className="max-w-md"
    >
      <div className="flex flex-col items-center justify-center pt-8 pb-4 text-center">
        {!CustomIcon && (
          <div
            className={cn(
              "mb-6 flex size-20 items-center justify-center rounded-full bg-white/5",
              variant === "danger" && "bg-red-500/10 text-red-400",
              variant === "success" && "bg-green-500/10 text-green-400",
              variant === "warning" && "bg-yellow-500/10 text-yellow-400",
              variant === "info" && "bg-primary/10 text-primary",
            )}
          >
            <Icon className="size-10" />
          </div>
        )}

        <h3 className="text-2xl font-bold tracking-tight text-white">{title}</h3>
        {description && (
          <p className="text-muted mt-2 max-w-[80%] text-sm leading-relaxed">
            {description}
          </p>
        )}

        {children && <div className="mt-6 w-full">{children}</div>}
      </div>
    </Modal>
  );
}
