"use client";

import * as React from "react";
import { Portal } from "@/components/ui/portal";
import { cn } from "@/lib/utils";

interface PlayerHoverCardProps {
  displayName: string;
  country: string | null;
  children: React.ReactNode;
}

export function PlayerHoverCard({
  displayName,
  country,
  children,
}: PlayerHoverCardProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [coords, setCoords] = React.useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });
  const [side, setSide] = React.useState<"top" | "bottom">("bottom");
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const triggerRef = React.useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const estimatedHeight = 160;
      const spaceBelow = viewportHeight - rect.bottom;

      const newSide =
        spaceBelow < estimatedHeight && rect.top > estimatedHeight
          ? "top"
          : "bottom";
      setSide(newSide);

      setCoords({
        top: newSide === "bottom" ? rect.bottom + 8 : rect.top - 8,
        left: rect.left,
      });
    }

    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  return (
    <div
      ref={triggerRef}
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}

      {isOpen && (
        <Portal>
          <div
            className={cn(
              "animate-in fade-in fixed z-9999 w-56 duration-200",
              side === "top" ? "zoom-in-95 -translate-y-full" : "zoom-in-95",
            )}
            style={{
              top: coords.top,
              left: coords.left,
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="glass-panel overflow-hidden rounded-2xl bg-[#0a080f] px-4 py-3 shadow-2xl ring-1 ring-white/10">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-xl bg-white/5 text-sm font-bold text-white/40">
                  {displayName.slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">
                    {displayName}
                  </p>
                  {country && (
                    <p className="text-muted flex items-center gap-1 text-[10px]">
                      <span
                        className={`fi fi-${country.toLowerCase()} h-2.5 w-3.5 rounded-xs`}
                      />
                      {country.toUpperCase()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}
