import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface PrimaryActionProps {
  label: string;
  icon?: LucideIcon;
  onClick?: () => void;
  className?: string;
  variant?: "red" | "primary";
  disabled?: boolean;
}

export function PrimaryAction({
  label,
  icon: Icon,
  onClick,
  className,
  variant = "primary",
  disabled,
}: PrimaryActionProps) {
  const variantStyles = {
    primary:
      "border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 hover:border-primary/50",
    red: "border-danger/30 bg-danger/10 text-danger hover:border-danger/50 hover:bg-danger/20",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "group flex w-full cursor-pointer items-center justify-center gap-3 rounded-2xl border px-6 py-4 text-sm font-bold tracking-wider uppercase transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:grayscale disabled:active:scale-100",
        variantStyles[variant],
        className,
      )}
    >
      {Icon && (
        <Icon className="size-4 transition-transform group-hover:scale-110" />
      )}
      {label}
    </button>
  );
}
