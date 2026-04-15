"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import React, { useRef } from "react";

interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  placeholder?: string;
  unit?: string;
}

export function NumberInput({
  value,
  onChange,
  min,
  max,
  step = 1,
  className,
  placeholder,
  unit,
}: NumberInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newValue = value - step;
    if (min !== undefined && newValue < min) return;
    onChange(newValue);
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newValue = value + step;
    if (max !== undefined && newValue > max) return;
    onChange(newValue);
  };

  return (
    <div
      className={cn(
        "relative flex items-center overflow-hidden rounded-2xl border border-white/10 bg-white/5",
        className,
      )}
    >
      <button
        type="button"
        onClick={handleDecrement}
        disabled={min !== undefined && value <= min}
        className="text-primary hover:bg-primary/10 absolute left-0 z-10 flex h-full w-8 items-center justify-center transition-all active:scale-90 disabled:opacity-20"
      >
        <ChevronLeft className="size-4" />
      </button>

      <div
        className="flex flex-1 cursor-text items-center justify-center"
        onClick={() => inputRef.current?.focus()}
      >
        <div className="relative flex items-baseline justify-center">
          <input
            ref={inputRef}
            type="number"
            value={value}
            onChange={(e) => {
              const val = Number(e.target.value);
              if (isNaN(val)) return;
              onChange(val);
            }}
            placeholder={placeholder}
            style={{
              width: `${Math.max(String(value).length, 1)}ch`,
              minWidth: "2ch",
            }}
            className="h-10 bg-transparent text-center text-sm font-bold text-white transition-all outline-none placeholder:text-white/20"
          />
          {unit && (
            <span className="pointer-events-none ml-1 text-[10px] font-bold whitespace-nowrap text-white/20">
              {unit}
            </span>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={handleIncrement}
        disabled={max !== undefined && value >= max}
        className="text-primary hover:bg-primary/10 absolute right-0 z-10 flex h-full w-8 items-center justify-center transition-all active:scale-90 disabled:opacity-20"
      >
        <ChevronRight className="size-4" />
      </button>
    </div>
  );
}
