"use client";

import { Calendar as CalendarIcon } from "lucide-react";
import * as Popover from "@radix-ui/react-popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format, parseISO, isValid } from "date-fns";
import { useMemo, useState } from "react";

interface DateInputProps {
  value: string;
  onChange: (value: string) => void;
  min?: string;
  className?: string;
  placeholder?: string;
}

export function DateInput({
  value,
  onChange,
  min,
  className,
  placeholder,
}: DateInputProps) {
  const selectedDate = value ? parseISO(value) : undefined;
  const minDate = min ? parseISO(min) : undefined;
  const [draftValue, setDraftValue] = useState<string | null>(null);

  const displayValue = useMemo(() => {
    if (draftValue !== null) {
      return draftValue;
    }

    if (!value) {
      return "";
    }

    const parsedValue = parseISO(value);

    return isValid(parsedValue) ? format(parsedValue, "dd / MM / yyyy") : "";
  }, [draftValue, value]);

  const formatDisplayValue = (rawValue: string) => {
    const digits = rawValue.replace(/\D/g, "").slice(0, 8);
    const day = digits.slice(0, 2);
    const month = digits.slice(2, 4);
    const year = digits.slice(4, 8);

    return [day, month, year].filter(Boolean).join(" / ");
  };

  const parseDisplayValue = (rawValue: string) => {
    const digits = rawValue.replace(/\D/g, "");

    if (digits.length !== 8) {
      return null;
    }

    const day = Number(digits.slice(0, 2));
    const month = Number(digits.slice(2, 4));
    const year = Number(digits.slice(4, 8));

    const parsedDate = new Date(year, month - 1, day);

    if (
      Number.isNaN(parsedDate.getTime()) ||
      parsedDate.getFullYear() !== year ||
      parsedDate.getMonth() !== month - 1 ||
      parsedDate.getDate() !== day
    ) {
      return null;
    }

    return format(parsedDate, "yyyy-MM-dd");
  };

  const handleSelect = (date: Date | undefined) => {
    if (date && isValid(date)) {
      setDraftValue(null);
      onChange(format(date, "yyyy-MM-dd"));
    }
  };

  const handleInputChange = (nextValue: string) => {
    const formattedValue = formatDisplayValue(nextValue);
    const parsedValue = parseDisplayValue(formattedValue);

    setDraftValue(formattedValue);

    if (!formattedValue) {
      onChange("");
      return;
    }

    if (parsedValue && (!min || parsedValue >= min)) {
      onChange(parsedValue);
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
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={(e) => handleInputChange(e.target.value)}
        onBlur={() => setDraftValue(null)}
        placeholder={placeholder}
        className="h-full flex-1 bg-transparent p-0 text-center text-sm font-bold text-white transition-all outline-none placeholder:text-white/20"
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
              className="animate-in fade-in zoom-in-95 transform-gpu rounded-2xl border border-white/20 bg-card-strong/60 p-1 shadow-2xl duration-200"
              style={{
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
              }}
            >
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleSelect}
                defaultMonth={selectedDate}
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
