"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { MATCH_FORMATS } from "@bellona/core";
import { LabelTooltip } from "@/components/ui/label-tooltip";
import { cn } from "@/lib/utils";

type MatchFormatsValues = {
  allowedFormats: string[];
};

export function MatchFormatsFieldset() {
  const t = useTranslations("Modals.AddLeague");
  const { control, setValue, getValues } = useFormContext<MatchFormatsValues>();
  const allowedFormats = useWatch({ control, name: "allowedFormats" }) ?? [];

  const matchFormatOptions = MATCH_FORMATS.map((value) => ({
    value,
    label: t(`matchFormats.options.${value}.label`),
    description: t(`matchFormats.options.${value}.description`),
  }));

  const toggleMatchFormat = (format: string) => {
    const values = getValues("allowedFormats") ?? [];
    const nextValues = values.includes(format)
      ? values.filter((item) => item !== format)
      : [...values, format];
    setValue("allowedFormats", nextValues, { shouldValidate: true });
  };

  return (
    <section className="animate-in fade-in slide-in-from-right-4 space-y-8 duration-500">
      <div className="flex flex-col gap-4">
        <LabelTooltip
          label={t("matchFormats.title")}
          tooltip={t("matchFormats.help")}
          required
        />

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {matchFormatOptions.map((option) => {
            const isLocked = option.value !== "ONE_V_ONE";
            const isSelected = allowedFormats.includes(option.value);

            return (
              <button
                key={option.value}
                type="button"
                disabled={isLocked}
                onClick={() => !isLocked && toggleMatchFormat(option.value)}
                className={cn(
                  "flex items-center justify-between gap-1.5 rounded-xl border px-3 py-2 text-left transition-all",
                  isLocked
                    ? "border-gold-dim/25 bg-card-strong/45 cursor-not-allowed opacity-50"
                    : isSelected
                      ? "border-primary/50 bg-primary/10 text-primary shadow-primary/10 shadow-lg"
                      : "border-gold-dim/35 bg-card-strong/45 text-secondary/80 hover:bg-card-strong/70",
                )}
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold">{option.label}</span>
                  <span className="text-secondary/45 text-[10px] leading-tight">
                    {option.description}
                  </span>
                </div>
                {isLocked ? (
                  <span className="text-secondary/25 shrink-0 text-[9px] font-bold tracking-[0.2em] uppercase">
                    {t("soon")}
                  </span>
                ) : (
                  isSelected && <Check className="size-3 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {allowedFormats.length === 0 && (
          <p className="text-danger text-xs">{t("matchFormats.required")}</p>
        )}
      </div>
    </section>
  );
}
