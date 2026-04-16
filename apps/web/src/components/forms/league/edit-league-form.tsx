"use client";

import { useTransition, useState, useEffect } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEditLeagueSchema, type EditLeagueValues } from "@/schemas/league";
import {
  Trophy,
  Swords,
  Zap,
  Clock,
  Hash,
  ArrowUpRight,
  ArrowDownRight,
  Equal,
  Activity,
  TrendingUp,
} from "lucide-react";
import { updateLeague } from "@/actions/game";
import { toast } from "sonner";
import { useLocale, useTranslations } from "next-intl";
import { Slider } from "@/components/ui/slider";
import { LabelTooltip } from "@/components/ui/label-tooltip";
import { NumberInput } from "@/components/ui/number-input";
import { type League } from "@/lib/apollo/generated/graphql";
import { formatHoursDuration } from "@/lib/date-utils";
import { cn } from "@/lib/utils";

interface EditLeagueFormProps {
  league: League;
  onSuccess: () => void;
  onLoadingChange?: (loading: boolean) => void;
  onValidationChange?: (isValid: boolean) => void;
  formId: string;
}

export function EditLeagueForm({
  league,
  onSuccess,
  onLoadingChange,
  onValidationChange,
  formId,
}: EditLeagueFormProps) {
  const t = useTranslations("Modals");
  const locale = useLocale();
  const schema = useEditLeagueSchema();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isValid },
  } = useForm<EditLeagueValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: league.name,
      slug: league.slug,
      description: league.description || "",
      ratingSystem: (league.ratingSystem as "elo" | "points") || "elo",
      initialElo: league.initialElo,
      allowDraw: league.allowDraw,
      kFactor: league.kFactor,
      scoreRelevance: league.scoreRelevance,
      inactivityDecay: league.inactivityDecay,
      inactivityThresholdHours: league.inactivityThresholdHours,
      inactivityDecayFloor: league.inactivityDecayFloor,
      pointsPerWin: league.pointsPerWin,
      pointsPerDraw: league.pointsPerDraw,
      pointsPerLoss: league.pointsPerLoss,
    },
    mode: "onChange",
  });

  const ratingSystem = useWatch({ control, name: "ratingSystem" });
  const allowDraw = useWatch({ control, name: "allowDraw" });
  const initialElo = useWatch({ control, name: "initialElo" }) || 0;
  const kFactor = useWatch({ control, name: "kFactor" }) || 0;
  const inactivityDecay = useWatch({ control, name: "inactivityDecay" }) || 0;
  const inactivityThresholdHours =
    useWatch({ control, name: "inactivityThresholdHours" }) || 0;
  const inactivityDecayFloor =
    useWatch({ control, name: "inactivityDecayFloor" }) || 0;
  const scoreRelevance = useWatch({ control, name: "scoreRelevance" }) || 0;
  const pointsPerWin = useWatch({ control, name: "pointsPerWin" }) || 0;
  const pointsPerDraw = useWatch({ control, name: "pointsPerDraw" }) || 0;
  const pointsPerLoss = useWatch({ control, name: "pointsPerLoss" }) || 0;
  const name = useWatch({ control, name: "name" }) || "";
  const formattedInactivityWindow = formatHoursDuration(
    inactivityThresholdHours,
    locale,
  );
  const getEloExplanationText = (
    key: "initial_score" | "match_impact",
    values: { initialElo?: number; kFactor?: number } = {},
  ) => {
    try {
      return t(`AddLeague.explanation.elo.${key}`, values);
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

  const [isSlugModified, setIsSlugModified] = useState(false);

  // Auto-generate slug from name if not manually modified
  useEffect(() => {
    if (!isSlugModified && name !== league.name) {
      setValue("slug", name.toLowerCase().replace(/[^a-z0-9-]/g, "-"), {
        shouldValidate: true,
      });
    }
  }, [name, isSlugModified, setValue, league.name]);

  // Notify parent about loading state
  useEffect(() => {
    onLoadingChange?.(isPending);
  }, [isPending, onLoadingChange]);

  // Notify parent about validation state
  useEffect(() => {
    onValidationChange?.(isValid);
  }, [isValid, onValidationChange]);

  const onSubmit = async (values: EditLeagueValues) => {
    startTransition(async () => {
      const isElo = values.ratingSystem === "elo";
      let result;

      if (isElo) {
        result = await updateLeague(league.id, {
          ...values,
          name: values.name,
          slug: values.slug,
          ratingSystem: values.ratingSystem,
          allowDraw: values.allowDraw,
          description: values.description ?? null,
          initialElo: values.initialElo ?? league.initialElo,
          kFactor: values.kFactor ?? league.kFactor,
          scoreRelevance: values.scoreRelevance ?? league.scoreRelevance,
          inactivityDecay: values.inactivityDecay ?? league.inactivityDecay,
          inactivityThresholdHours:
            values.inactivityThresholdHours ?? league.inactivityThresholdHours,
          inactivityDecayFloor:
            values.inactivityDecayFloor ?? league.inactivityDecayFloor,
          // Mantemos os valores atuais de pontos para evitar nulos se a action exigir
          pointsPerWin: league.pointsPerWin,
          pointsPerDraw: league.pointsPerDraw,
          pointsPerLoss: league.pointsPerLoss,
        });
      } else {
        result = await updateLeague(league.id, {
          ...values,
          name: values.name,
          slug: values.slug,
          ratingSystem: values.ratingSystem,
          allowDraw: values.allowDraw,
          description: values.description ?? null,
          pointsPerWin: values.pointsPerWin ?? league.pointsPerWin,
          pointsPerDraw: values.pointsPerDraw ?? league.pointsPerDraw,
          pointsPerLoss: values.pointsPerLoss ?? league.pointsPerLoss,
          // Mantemos os valores atuais de elo para evitar nulos se a action exigir
          initialElo: league.initialElo,
          kFactor: league.kFactor,
          scoreRelevance: league.scoreRelevance,
          inactivityDecay: league.inactivityDecay,
          inactivityThresholdHours: league.inactivityThresholdHours,
          inactivityDecayFloor: league.inactivityDecayFloor,
        });
      }

      if (result.success) {
        toast.success(t("EditLeague.success"));
        onSuccess();
      } else {
        toast.error(result.error || t("EditLeague.error"));
      }
    });
  };

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-10">
      {/* Section 1: General Data */}
      <section className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <LabelTooltip label={t("AddLeague.name.label")} required />
            <input
              type="text"
              {...register("name")}
              placeholder={t("AddLeague.name.placeholder")}
              className={cn(
                "focus:border-primary/50 focus:ring-primary/10 w-full rounded-2xl border bg-white/5 px-5 py-3 text-sm text-white transition-all outline-none placeholder:text-white/20 focus:bg-white/[0.07] focus:ring-4",
                errors.name ? "border-red-500/50" : "border-white/10",
              )}
            />
            {errors.name && (
              <p className="ml-1 text-xs text-red-400">{errors.name.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <LabelTooltip
              label={t("AddLeague.slug.label")}
              tooltip={t("AddLeague.slug.tooltip")}
              required
            />
            <input
              type="text"
              {...register("slug")}
              onChange={(e) => {
                setValue(
                  "slug",
                  e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
                  { shouldValidate: true },
                );
                setIsSlugModified(true);
              }}
              placeholder={t("AddLeague.slug.placeholder")}
              className={cn(
                "focus:border-primary/50 focus:ring-primary/10 w-full rounded-2xl border bg-white/5 px-5 py-3 text-sm text-white transition-all outline-none placeholder:text-white/20 focus:bg-white/[0.07] focus:ring-4",
                errors.slug ? "border-red-500/50" : "border-white/10",
              )}
            />
            {errors.slug && (
              <p className="ml-1 text-xs text-red-400">{errors.slug.message}</p>
            )}
          </div>

          <div className="col-span-full flex flex-col gap-2">
            <LabelTooltip label={t("AddLeague.descriptionField.label")} />
            <textarea
              {...register("description")}
              placeholder={t("AddLeague.descriptionField.placeholder")}
              className={cn(
                "focus:border-primary/50 focus:ring-primary/10 min-h-[80px] w-full rounded-2xl border bg-white/5 px-5 py-3 text-sm text-white transition-all outline-none placeholder:text-white/20 focus:bg-white/[0.07] focus:ring-4",
                errors.description ? "border-red-500/50" : "border-white/10",
              )}
            />
            {errors.description && (
              <p className="ml-1 text-xs text-red-400">
                {errors.description.message}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Section 2: Format Logic */}
      <section className="space-y-6">
        <div className="flex flex-col gap-10">
          {/* System Selector - Full Width Row */}
          <div className="flex flex-col gap-4">
            <LabelTooltip label={t("AddLeague.ratingSystem.label")} />
            <div className="grid grid-cols-2 gap-3 sm:w-1/2">
              <button
                type="button"
                onClick={() => {
                  setValue("ratingSystem", "elo");
                }}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-2xl border p-4 text-sm font-bold transition-all",
                  ratingSystem === "elo"
                    ? "border-primary/50 bg-primary/10 text-primary shadow-primary/10 shadow-lg"
                    : "border-white/5 bg-white/5 text-white/40 hover:bg-white/10",
                )}
              >
                <Trophy className="size-4" />
                {t("AddLeague.ratingSystem.elo")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setValue("ratingSystem", "points");
                }}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-2xl border p-4 text-sm font-bold transition-all",
                  ratingSystem === "points"
                    ? "border-primary/50 bg-primary/10 text-primary shadow-primary/10 shadow-lg"
                    : "border-white/5 bg-white/5 text-white/40 hover:bg-white/10",
                )}
              >
                <Hash className="size-4" />
                {t("AddLeague.ratingSystem.points")}
              </button>
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-5">
            {/* Left Column: Config Inputs */}
            <div className="space-y-8 md:col-span-2">
              {/* Allow Draw Toggle */}
              <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/2 p-4">
                <LabelTooltip
                  label={t("AddLeague.allowDraw.label")}
                  tooltip={t("AddLeague.allowDraw.tooltip")}
                />
                <button
                  type="button"
                  onClick={() => setValue("allowDraw", !allowDraw)}
                  className={cn(
                    "ring-primary/20 relative h-6 w-11 rounded-full transition-colors outline-none focus:ring-4",
                    allowDraw ? "bg-primary" : "bg-white/10",
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
                {ratingSystem === "elo" ? (
                  <div className="grid gap-6">
                    <div className="flex flex-col gap-2">
                      <LabelTooltip label={t("AddLeague.initialElo.label")} />
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
                        label={t("AddLeague.kFactor.label")}
                        tooltip={t("AddLeague.kFactor.tooltip")}
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
                    <div className="flex flex-col gap-3">
                      <LabelTooltip
                        label={t("AddLeague.scoreRelevance.label")}
                        tooltip={t("AddLeague.scoreRelevance.tooltip")}
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
                  </div>
                ) : (
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between gap-4">
                      <LabelTooltip
                        label={t("AddLeague.pointsPerWin.label")}
                        labelClassName="text-xs font-bold tracking-wider text-white/40"
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
                          label={t("AddLeague.pointsPerDraw.label")}
                          labelClassName="text-xs font-bold tracking-wider text-white/40"
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
                        label={t("AddLeague.pointsPerLoss.label")}
                        labelClassName="text-xs font-bold tracking-wider text-white/40"
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

            {/* Right Column: Inactivity & Explanation Box */}
            <div className="space-y-6 md:col-span-3">
              {/* Inactivity Settings (Elo only) */}
              {ratingSystem === "elo" && (
                <div className="space-y-4 rounded-2xl border border-white/5 bg-white/2 p-5">
                  <div className="flex items-center gap-2 text-white/40">
                    <Clock className="size-3.5" />
                    <span className="text-[10px] font-bold tracking-widest uppercase">
                      {t("AddLeague.inactivityDecay.label")}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <LabelTooltip
                        label={t("AddLeague.inactivityDecay.labelShort")}
                        tooltip={t("AddLeague.inactivityDecay.tooltip")}
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
                        <div className="animate-in fade-in slide-in-from-left-2 space-y-1.5 duration-300">
                          <LabelTooltip
                            label={t(
                              "AddLeague.inactivityThreshold.labelShort",
                            )}
                            tooltip={t("AddLeague.inactivityThreshold.tooltip")}
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
                                unit="h"
                              />
                            )}
                          />
                        </div>
                        <div className="animate-in fade-in slide-in-from-top-2 col-span-full space-y-1.5 pt-2 duration-300">
                          <LabelTooltip
                            label={t("AddLeague.inactivityFloor.label")}
                            tooltip={t("AddLeague.inactivityFloor.tooltip")}
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
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Explanation Box */}
              <div className="border-primary/20 bg-primary/3 shadow-primary/5 relative overflow-hidden rounded-3xl border p-6 shadow-2xl">
                <div className="bg-primary/5 absolute -top-12 -right-12 h-32 w-32 rounded-full blur-3xl" />

                <h4 className="text-primary mb-4 flex items-center gap-2 text-sm font-bold">
                  <Zap className="size-4" />
                  {t("AddLeague.explanation.title")}
                </h4>

                <div className="space-y-5 text-xs leading-relaxed text-white/60">
                  <p className="font-medium text-white/80 italic">
                    {ratingSystem === "elo"
                      ? t("AddLeague.explanation.elo.description")
                      : t("AddLeague.explanation.points.description")}
                  </p>

                  <div className="grid gap-3 pt-2">
                    {ratingSystem === "elo" ? (
                      <>
                        <div className="flex items-center gap-3">
                          <div className="text-primary flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white/5">
                            <Trophy className="size-3" />
                          </div>
                          <span>
                            {getEloExplanationText("initial_score", {
                              initialElo,
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-primary flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white/5">
                            <ArrowUpRight className="size-3" />
                          </div>
                          <span>
                            {getEloExplanationText("match_impact", {
                              kFactor,
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white/5",
                              scoreRelevance > 0
                                ? "text-primary"
                                : "text-white/40",
                            )}
                          >
                            <TrendingUp className="size-3" />
                          </div>
                          <span>
                            {(() => {
                              if (scoreRelevance === 0)
                                return t(
                                  "AddLeague.explanation.elo.relevance_1",
                                );
                              if (scoreRelevance <= 0.3)
                                return t(
                                  "AddLeague.explanation.elo.relevance_2",
                                );
                              if (scoreRelevance <= 0.6)
                                return t(
                                  "AddLeague.explanation.elo.relevance_3",
                                );
                              if (scoreRelevance < 1)
                                return t(
                                  "AddLeague.explanation.elo.relevance_4",
                                );
                              return t("AddLeague.explanation.elo.relevance_5");
                            })()}
                          </span>
                        </div>

                        {/* Win Margin Thresholds */}
                        <div className="mt-1 space-y-2 rounded-2xl bg-white/2 p-4">
                          <p className="text-[10px] font-bold tracking-wider text-white/30 uppercase">
                            {t("AddLeague.explanation.elo.thresholds")}
                          </p>
                          <div className="grid grid-cols-2 gap-4 gap-y-3 sm:grid-cols-3">
                            {[1, 3, 5, 10, 20].map((m) => {
                              const multiplier = 1 + (m - 1) * scoreRelevance;
                              return (
                                <div key={m} className="flex flex-col gap-0.5">
                                  <span className="text-[10px] text-white/40">
                                    {t("AddLeague.explanation.elo.win_margin", {
                                      margin: m,
                                    })}
                                  </span>
                                  <span className="text-xs font-bold text-white/90">
                                    {multiplier.toFixed(1)}x
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white/5",
                              allowDraw ? "text-primary" : "text-white/40",
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
                              ? t("AddLeague.explanation.elo.draws_enabled")
                              : t("AddLeague.explanation.elo.draws_disabled")}
                          </span>
                        </div>
                        {inactivityDecay > 0 && (
                          <div className="flex items-center gap-3">
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white/5 text-red-500/50">
                              <Activity className="size-3" />
                            </div>
                            <span>
                              {t("AddLeague.explanation.elo.decay", {
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
                          <ArrowUpRight className="size-4 text-emerald-500" />
                          <span className="text-white/80">
                            {t("AddLeague.explanation.points.win", {
                              amount: pointsPerWin || 0,
                            })}
                          </span>
                        </div>
                        {allowDraw && (
                          <div className="flex items-center gap-3">
                            <Equal className="size-4 text-amber-500" />
                            <span className="text-white/80">
                              {t("AddLeague.explanation.points.draw", {
                                amount: pointsPerDraw || 0,
                              })}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-3">
                          <ArrowDownRight className="size-4 text-rose-500" />
                          <span className="text-white/80">
                            {t("AddLeague.explanation.points.loss", {
                              amount: pointsPerLoss || 0,
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
    </form>
  );
}
