"use client";

import { Calendar as CalendarIcon } from "lucide-react";
import * as Popover from "@radix-ui/react-popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import React, { useRef } from "react";
import { format, parseISO, isValid } from "date-fns";

interface DateInputProps {
  value: string;
  onChange: (value: string) => void;
  min?: string;
  className?: string;
  placeholder?: string;
}

export function DateInput({ value, onChange, min, className }: DateInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedDate = value ? parseISO(value) : undefined;
  const minDate = min ? parseISO(min) : undefined;

  const handleSelect = (date: Date | undefined) => {
    if (date && isValid(date)) {
      onChange(format(date, "yyyy-MM-dd"));
    }
  };

  return (
    <div
      className={cn(
        "group focus-within:border-primary/50 focus-within:ring-primary/10 relative flex h-10 items-center overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition-all focus-within:bg-white/[0.07] focus-within:ring-4",
        className,
      )}
    >
      {/* Ghost spacer to perfectly center the input against the right-side icon button */}
      <div className="w-10 shrink-0" />

      <input
        ref={inputRef}
        type="date"
        value={value}
        min={min}
        onChange={(e) => onChange(e.target.value)}
        className="h-full flex-1 bg-transparent p-0 text-center text-sm font-bold text-white scheme-dark transition-all outline-none placeholder:text-white/20 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-clear-button]:hidden [&::-webkit-datetime-edit]:flex [&::-webkit-datetime-edit]:justify-center [&::-webkit-datetime-edit-fields-wrapper]:p-0 [&::-webkit-inner-spin-button]:hidden"
      />

      <Popover.Root>
        <Popover.Trigger asChild>
          <button
            type="button"
            className="hover:bg-primary/10 flex h-full w-10 shrink-0 items-center justify-center transition-colors outline-none"
          >
            <CalendarIcon className="text-primary size-4" />
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content sideOffset={8} align="end" className="z-9999">
            <div
              className="animate-in fade-in zoom-in-95 transform-gpu rounded-2xl border border-white/20 bg-black/50 p-1 shadow-2xl duration-200"
              style={{
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
              }}
            >
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleSelect}
                disabled={minDate ? (date) => date < minDate : undefined}
                initialFocus
              />
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}
