import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-6 md:flex-row md:items-end md:justify-between",
        className,
      )}
    >
      <div className="space-y-3">
        {eyebrow && (
          <p className="text-primary/90 font-mono text-xs font-medium tracking-[0.35em] uppercase">
            {eyebrow}
          </p>
        )}
        <div className="space-y-1">
          <h2 className="text-primary font-mono text-2xl font-bold tracking-tight uppercase sm:text-3xl lg:text-4xl">
            {title}
          </h2>
          {description && (
            <div className="text-muted sm:text-md max-w-3xl text-base leading-relaxed">
              {description}
            </div>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex shrink-0 items-center gap-4">{actions}</div>
      )}
    </div>
  );
}
