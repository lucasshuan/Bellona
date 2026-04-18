"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CustomSelectProps<T extends string | number> {
  value: T;
  onChange: (value: T) => void;
  options: { label: string; value: T }[];
  className?: string;
  triggerClassName?: string;
}

export function CustomSelect<T extends string | number>({
  value,
  onChange,
  options,
  className,
  triggerClassName,
}: CustomSelectProps<T>) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [coords, setCoords] = React.useState({ top: 0, left: 0, width: 0 });
  const containerRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = () => {
    if (!isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className={cn("relative", className)} ref={containerRef}>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        className={cn(
          "flex items-center justify-between gap-2 rounded-xl border border-white/5 bg-white/5 px-3 py-1.5 text-[11px] font-bold text-white transition-all hover:bg-white/10 active:scale-[0.98]",
          isOpen && "ring-primary/20 bg-white/10 ring-4",
          triggerClassName,
        )}
      >
        <span className="truncate">{selectedOption?.label}</span>
        <ChevronDown
          className={cn(
            "size-3.5 text-white/30 transition-transform duration-200",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {isOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="glass-panel custom-scrollbar animate-in fade-in zoom-in-95 fixed z-9999 mt-2 max-h-64 min-w-25 overflow-y-auto rounded-xl py-1 shadow-2xl duration-100"
            style={{
              top: coords.top,
              left: coords.left,
              width: coords.width,
            }}
          >
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={cn(
                  "flex w-full items-center justify-between gap-4 px-3 py-2 text-left text-[11px] font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white",
                  option.value === value && "bg-primary/10 text-primary",
                )}
              >
                {option.label}
                {option.value === value && <Check className="size-3" />}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </div>
  );
}
