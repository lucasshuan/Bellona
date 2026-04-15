import { useEffect, useRef, type ElementType } from "react";
import { createPortal } from "react-dom";
import { X, LoaderCircle, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  // Footer actions
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  isPending?: boolean;
  disabled?: boolean;
  formId?: string; // To link the submit button to an internal form
  confirmIntent?: "primary" | "secondary" | "danger" | "ghost" | "outline";
  confirmIcon?: ElementType;
  cancelIcon?: ElementType;
  showHeader?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  className = "sm:max-w-3xl lg:max-w-4xl",
  confirmText,
  cancelText,
  onConfirm,
  isPending,
  disabled,
  formId,
  confirmIntent = "primary",
  confirmIcon: ConfirmIcon = Save,
  cancelIcon: CancelIcon = X,
  showHeader = true,
}: ModalProps) {
  const modalContainerRef = useRef<HTMLDivElement>(null);

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

  const showFooter = !!confirmText || !!cancelText;

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
        {showHeader ? (
          <div className="flex shrink-0 items-center justify-between border-b border-white/5 p-6 lg:px-8">
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
              className="cursor-pointer rounded-full p-2 text-white/70 transition-colors hover:bg-white/10"
            >
              <X className="size-5" />
            </button>
          </div>
        ) : (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 cursor-pointer rounded-full p-2 text-white/30 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="size-5" />
          </button>
        )}

        {/* Content - Scrollable */}
        <div className="custom-scrollbar flex-1 overflow-y-auto p-6 lg:px-8">
          {children}
        </div>

        {/* Footer - Fixed */}
        {showFooter && (
          <div className="flex shrink-0 items-center justify-end gap-3 border-t border-white/5 bg-white/2 p-6 lg:px-8">
            {cancelText && (
              <Button
                intent="ghost"
                onClick={onClose}
                disabled={isPending}
                className="rounded-2xl px-6"
              >
                {CancelIcon && (
                  <CancelIcon className="mr-2 size-4 opacity-70" />
                )}
                {cancelText}
              </Button>
            )}
            {confirmText && (
              <Button
                type={formId ? "submit" : "button"}
                form={formId}
                onClick={onConfirm}
                disabled={disabled || isPending}
                intent={confirmIntent}
                className="rounded-2xl px-8"
              >
                {isPending ? (
                  <LoaderCircle className="mr-2 size-4 animate-spin" />
                ) : (
                  ConfirmIcon && <ConfirmIcon className="mr-2 size-4" />
                )}
                {confirmText}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
