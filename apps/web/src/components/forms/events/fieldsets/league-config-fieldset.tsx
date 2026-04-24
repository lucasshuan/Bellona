"use client";

import { useFormContext, useWatch, Controller } from "react-hook-form";
import {
  Trophy,
  Swords,
  Equal,
  Zap,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  TrendingUp,
} from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { Slider } from "@/components/ui/slider";
import { LabelTooltip } from "@/components/ui/label-tooltip";
import { NumberInput } from "@/components/ui/number-input";
import { formatHoursDuration } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import { EloMatchSimulator } from "@/components/forms/events/league/elo-match-simulator";

type LeagueConfigValues = {
  ratingSystem: "ELO" | "POINTS";
  allowDraw: boolean;
  initialElo?: number;
  kFactor?: number;
  scoreRelevance?: number;
  inactivityDecay?: number;
  inactivityThresholdHours?: number;
  inactivityDecayFloor?: number;
  pointsPerWin?: number;
  pointsPerDraw?: number;
  pointsPerLoss?: number;
};

interface LeagueConfigFieldsetProps {
  disableRatingSystemChange?: boolean;
}

export function LeagueConfigFieldset({
  disableRatingSystemChange,
}: LeagueConfigFieldsetProps) {
  const t = useTranslations("Modals.AddEvent");
  const locale = useLocale();
  const { control, setValue } = useFormContext<LeagueConfigValues>();

  const ratingSystem = useWatch({ control, name: "ratingSystem" });
  const allowDraw = useWatch({ control, name: "allowDraw" });
  const initialElo = useWatch({ control, name: "initialElo" }) ?? 0;
  const kFactor = useWatch({ control, name: "kFactor" }) ?? 0;
  const inactivityDecay = useWatch({ control, name: "inactivityDecay" }) ?? 0;
  const inactivityThresholdHours =
    useWatch({ control, name: "inactivityThresholdHours" }) ?? 0;
  const inactivityDecayFloor =
    useWatch({ control, name: "inactivityDecayFloor" }) ?? 0;
  const scoreRelevance = useWatch({ control, name: "scoreRelevance" }) ?? 0;
  const pointsPerWin = useWatch({ control, name: "pointsPerWin" }) ?? 0;
  const pointsPerDraw = useWatch({ control, name: "pointsPerDraw" }) ?? 0;
  const pointsPerLoss = useWatch({ control, name: "pointsPerLoss" }) ?? 0;

  const formattedInactivityWindow = formatHoursDuration(
    inactivityThresholdHours,
    locale,
  );

  const getEloExplanationText = (
    key: "initial_score" | "match_impact",
    values: { initialElo?: number; kFactor?: number } = {},
  ) => {
    try {
      return t(`explanation.elo.${key}`, values);
    } catch {
      if (key === "initial_score") {
        return locale === "pt"
          ? `Todos começam com ${values.initialElo ?? 0} pts.`
          : `Everyone starts with ${values.initialElo ?? 0} pts.`;
      }
      return locale === "pt"
        ? `Os resultados desta liga costumam mover a pontuação em cerca de ${values.kFactor ?? 0} pts.`
        : `Results in this league typically move ratings by around ${values.kFactor ?? 0} pts.`;
    }
  };

  return (
    <section className="animate-in fade-in slide-in-from-right-4 space-y-6 duration-500">
      <div className="flex flex-col gap-10">
        {/* Rating System Selector */}
        <div className="flex flex-col gap-4">
          <LabelTooltip label={t("ratingSystem.label")} />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() =>
                !disableRatingSystemChange && setValue("ratingSystem", "ELO")
              }
              disabled={disableRatingSystemChange}
              className={cn(
                "flex flex-col items-start gap-2 rounded-2xl border p-4 text-left transition-all",
                disableRatingSystemChange && "cursor-not-allowed",
                ratingSystem === "ELO"
                  ? "border-primary/50 bg-primary/10 text-primary shadow-primary/10 shadow-lg"
                  : "border-gold-dim/25 bg-card-strong/45 text-secondary/45",
                !disableRatingSystemChange &&
                  ratingSystem !== "ELO" &&
                  "hover:bg-card-strong/70",
              )}
            >
              <span className="text-sm font-bold">{t("ratingSystem.elo")}</span>
              <span className="text-secondary/55 text-xs leading-relaxed">
                {t("ratingSystem.elo_description")}
              </span>
            </button>
            <button
              type="button"
              onClick={() =>
                !disableRatingSystemChange && setValue("ratingSystem", "POINTS")
              }
              disabled={disableRatingSystemChange}
              className={cn(
                "flex flex-col items-start gap-2 rounded-2xl border p-4 text-left transition-all",
                disableRatingSystemChange && "cursor-not-allowed",
                ratingSystem === "POINTS"
                  ? "border-primary/50 bg-primary/10 text-primary shadow-primary/10 shadow-lg"
                  : "border-gold-dim/25 bg-card-strong/45 text-secondary/45",
                !disableRatingSystemChange &&
                  ratingSystem !== "POINTS" &&
                  "hover:bg-card-strong/70",
              )}
            >
              <span className="text-sm font-bold">
                {t("ratingSystem.points")}
              </span>
              <span className="text-secondary/55 text-xs leading-relaxed">
                {t("ratingSystem.points_description")}
              </span>
            </button>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-5">
          {/* Left column: Config inputs */}
          <div className="space-y-8 md:col-span-2">
            {/* Allow Draw Toggle */}
            <div className="border-gold-dim/25 bg-card-strong/25 flex items-center justify-between rounded-2xl border p-4">
              <LabelTooltip
                label={t("allowDraw.label")}
                tooltip={t("allowDraw.tooltip")}
              />
              <button
                type="button"
                onClick={() => setValue("allowDraw", !allowDraw)}
                className={cn(
                  "ring-primary/20 relative h-6 w-11 rounded-full transition-colors outline-none focus:ring-4",
                  allowDraw ? "bg-primary" : "bg-card-strong/70",
                )}
              >
                <div
                  className={cn(
                    "absolute top-1 left-1 h-4 w-4 rounded-full bg-white transition-all",
                    allowDraw ? "translate-x-5" : "translate-x-0",
                  )}
                />
              </button>
            </div>

            <div className="space-y-6">
              {ratingSystem === "ELO" ? (
                <div className="grid gap-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <LabelTooltip label={t("initialElo.label")} />
                      <Controller
                        name="initialElo"
                        control={control}
                        render={({ field }) => (
                          <NumberInput
                            value={field.value ?? 0}
                            onChange={field.onChange}
                            step={100}
                          />
                        )}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <LabelTooltip
                        label={t("kFactor.label")}
                        tooltip={t("kFactor.tooltip")}
                      />
                      <Controller
                        name="kFactor"
                        control={control}
                        render={({ field }) => (
                          <NumberInput
                            value={field.value ?? 0}
                            onChange={field.onChange}
                            min={1}
                            max={100}
                          />
                        )}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <LabelTooltip
                      label={t("scoreRelevance.label")}
                      tooltip={t("scoreRelevance.tooltip")}
                    />
                    <Controller
                      name="scoreRelevance"
                      control={control}
                      render={({ field }) => (
                        <Slider
                          value={field.value ?? 0}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                          min={0}
                          max={1}
                          step={0.1}
                        />
                      )}
                    />
                  </div>

                  {/* Inactivity Decay */}
                  <div className="border-gold-dim/25 bg-card-strong/25 mt-2 space-y-4 rounded-2xl border p-5 text-left">
                    <div className="text-secondary/45 flex items-center gap-2">
                      <Clock className="size-3.5" />
                      <span className="text-[10px] font-bold tracking-widest uppercase">
                        {t("inactivityDecay.label")}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-left">
                      <div className="space-y-1.5">
                        <LabelTooltip
                          label={t("inactivityDecay.labelShort")}
                          tooltip={t("inactivityDecay.tooltip")}
                          className="gap-1! opacity-60"
                        />
                        <Controller
                          name="inactivityDecay"
                          control={control}
                          render={({ field }) => (
                            <NumberInput
                              value={field.value ?? 0}
                              onChange={field.onChange}
                              min={0}
                            />
                          )}
                        />
                      </div>
                      {inactivityDecay > 0 && (
                        <>
                          <div className="animate-in fade-in slide-in-from-top-2 space-y-1.5 duration-300">
                            <LabelTooltip
                              label={t("inactivityFloor.label")}
                              tooltip={t("inactivityFloor.tooltip")}
                              className="gap-1! opacity-60"
                            />
                            <Controller
                              name="inactivityDecayFloor"
                              control={control}
                              render={({ field }) => (
                                <NumberInput
                                  value={field.value ?? 0}
                                  onChange={field.onChange}
                                  step={100}
                                  min={0}
                                />
                              )}
                            />
                          </div>
                          <div className="animate-in fade-in slide-in-from-left-2 col-span-full space-y-2 duration-300">
                            <LabelTooltip
                              label={t("inactivityThreshold.labelShort")}
                              tooltip={t("inactivityThreshold.tooltip")}
                              className="gap-1! opacity-60"
                            />
                            <Controller
                              name="inactivityThresholdHours"
                              control={control}
                              render={({ field }) => (
                                <NumberInput
                                  value={field.value ?? 0}
                                  onChange={field.onChange}
                                  min={1}
                                  step={5}
                                  unit={t("inactivityThreshold.unit")}
                                />
                              )}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid gap-4">
                  <div className="flex items-center justify-between gap-4">
                    <LabelTooltip
                      label={t("pointsPerWin.label")}
                      labelClassName="text-[10px] font-bold tracking-wider text-secondary/45 uppercase"
                      required
                    />
                    <Controller
                      name="pointsPerWin"
                      control={control}
                      render={({ field }) => (
                        <NumberInput
                          value={field.value ?? 0}
                          onChange={field.onChange}
                          className="w-32"
                          min={0}
                        />
                      )}
                    />
                  </div>
                  {allowDraw && (
                    <div className="flex items-center justify-between gap-4">
                      <LabelTooltip
                        label={t("pointsPerDraw.label")}
                        labelClassName="text-[10px] font-bold tracking-wider text-secondary/45 uppercase"
                        required
                      />
                      <Controller
                        name="pointsPerDraw"
                        control={control}
                        render={({ field }) => (
                          <NumberInput
                            value={field.value ?? 0}
                            onChange={field.onChange}
                            className="w-32"
                            min={0}
                          />
                        )}
                      />
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-4">
                    <LabelTooltip
                      label={t("pointsPerLoss.label")}
                      labelClassName="text-[10px] font-bold tracking-wider text-secondary/45 uppercase"
                      required
                    />
                    <Controller
                      name="pointsPerLoss"
                      control={control}
                      render={({ field }) => (
                        <NumberInput
                          value={field.value ?? 0}
                          onChange={field.onChange}
                          className="w-32"
                          min={0}
                        />
                      )}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right column: Explanation box */}
          <div className="space-y-6 md:col-span-3">
            <div className="border-primary/20 bg-primary/3 shadow-primary/5 relative overflow-hidden rounded-3xl border p-6 shadow-2xl">
              <h4 className="text-primary mb-4 flex items-center gap-2 text-sm font-bold">
                <Zap className="size-4" />
                {t("explanation.title")}
              </h4>
              <div className="text-secondary/70 space-y-5 text-xs leading-relaxed">
                <p className="text-secondary/90 font-medium italic">
                  {ratingSystem === "ELO"
                    ? t("explanation.elo.description")
                    : t("explanation.points.description")}
                </p>
                <div className="grid gap-3 pt-2">
                  {ratingSystem === "ELO" ? (
                    <>
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "bg-card-strong/45 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg",
                            allowDraw ? "text-primary" : "text-secondary/45",
                          )}
                        >
                          {allowDraw ? (
                            <Equal className="size-3" />
                          ) : (
                            <Swords className="size-3" />
                          )}
                        </div>
                        <span>
                          {allowDraw
                            ? t("explanation.elo.draws_enabled")
                            : t("explanation.elo.draws_disabled")}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-primary bg-card-strong/45 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg">
                          <Trophy className="size-3" />
                        </div>
                        <span>
                          {getEloExplanationText("initial_score", {
                            initialElo,
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-primary bg-card-strong/45 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg">
                          <ArrowUpRight className="size-3" />
                        </div>
                        <span>
                          {getEloExplanationText("match_impact", { kFactor })}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "bg-card-strong/45 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg",
                            scoreRelevance > 0
                              ? "text-primary"
                              : "text-secondary/45",
                          )}
                        >
                          <TrendingUp className="size-3" />
                        </div>
                        <span>
                          {(() => {
                            if (scoreRelevance === 0)
                              return t("explanation.elo.relevance_1");
                            if (scoreRelevance <= 0.3)
                              return t("explanation.elo.relevance_2");
                            if (scoreRelevance <= 0.6)
                              return t("explanation.elo.relevance_3");
                            if (scoreRelevance < 1)
                              return t("explanation.elo.relevance_4");
                            return t("explanation.elo.relevance_5");
                          })()}
                        </span>
                      </div>
                      <EloMatchSimulator
                        scoreRelevance={scoreRelevance}
                        kFactor={kFactor}
                        initialElo={initialElo}
                      />
                      {inactivityDecay > 0 && (
                        <div className="flex items-center gap-3">
                          <div className="text-danger/50 bg-card-strong/45 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg">
                            <Activity className="size-3" />
                          </div>
                          <span>
                            {t("explanation.elo.decay", {
                              amount: inactivityDecay,
                              window: formattedInactivityWindow,
                              floor: inactivityDecayFloor,
                            })}
                          </span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="grid gap-3">
                      <div className="flex items-center gap-3">
                        <ArrowUpRight className="text-success size-4" />
                        <span className="text-secondary/90">
                          {t("explanation.points.win", {
                            amount: pointsPerWin,
                          })}
                        </span>
                      </div>
                      {allowDraw && (
                        <div className="flex items-center gap-3">
                          <Equal className="text-warning size-4" />
                          <span className="text-secondary/90">
                            {t("explanation.points.draw", {
                              amount: pointsPerDraw,
                            })}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        <ArrowDownRight className="text-danger size-4" />
                        <span className="text-secondary/90">
                          {t("explanation.points.loss", {
                            amount: pointsPerLoss,
                          })}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
