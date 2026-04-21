"use client";

import { useTransition, useState, useEffect, useRef } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import Image from "next/image";
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
  LoaderCircle,
  Check,
  X,
} from "lucide-react";
import { updateLeague, checkLeagueSlugAvailability } from "@/actions/game";
import { toast } from "sonner";
import { useLocale, useTranslations } from "next-intl";
import { Slider } from "@/components/ui/slider";
import { LabelTooltip } from "@/components/ui/label-tooltip";
import { NumberInput } from "@/components/ui/number-input";
import { formatHoursDuration } from "@/lib/date-utils";
import { cn, slugify } from "@/lib/utils";
import { MATCH_FORMATS } from "@ares/core";
import { EloMatchSimulator } from "./elo-match-simulator";

type LeagueForEdit = {
  eventId: string;
  name: string;
  slug: string;
  description?: string | null;
  classificationSystem: "ELO" | "POINTS";
  allowDraw?: boolean | null;
  config: Record<string, unknown>;
  allowedFormats?: string[] | null;
  game?: {
    name: string;
    slug: string;
    thumbnailImageUrl?: string | null;
  } | null;
};

interface EditLeagueFormProps {
  league: LeagueForEdit;
  onSuccess: () => void;
  onLoadingChange?: (loading: boolean) => void;
  onValidationChange?: (isValid: boolean) => void;
  onStepValidationChange?: (isValid: boolean) => void;
  currentStep: number;
  formId: string;
}

export function EditLeagueForm({
  league,
  onSuccess,
  onLoadingChange,
  onValidationChange,
  onStepValidationChange,
  currentStep,
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
    getValues,
    formState: { errors, isValid },
  } = useForm<EditLeagueValues>({
    resolver: zodResolver(schema),
    defaultValues: (() => {
      const cfg = league.config as Record<string, number>;
      return {
        name: league.name,
        slug: league.slug,
        description: league.description || "",
        ratingSystem: league.classificationSystem,
        initialElo: cfg.initialElo ?? 1000,
        allowDraw: league.allowDraw ?? true,
        kFactor: cfg.kFactor ?? 20,
        scoreRelevance: cfg.scoreRelevance ?? 0,
        inactivityDecay: cfg.inactivityDecay ?? 0,
        inactivityThresholdHours: cfg.inactivityThresholdHours ?? 120,
        inactivityDecayFloor: cfg.inactivityDecayFloor ?? 1000,
        pointsPerWin: cfg.pointsPerWin ?? 3,
        pointsPerDraw: cfg.pointsPerDraw ?? 1,
        pointsPerLoss: cfg.pointsPerLoss ?? 0,
        allowedFormats:
          (league.allowedFormats?.length ?? 0) > 0
            ? [...(league.allowedFormats as string[])]
            : ["ONE_V_ONE"],
      };
    })(),
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
  const allowedFormats = useWatch({ control, name: "allowedFormats" }) || [];
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
  const [slugAvailability, setSlugAvailability] = useState<{
    value: string;
    status: "idle" | "available" | "conflict";
  }>({
    value: league.slug,
    status: "available",
  });
  const slugRequestRef = useRef(0);

  const slug = useWatch({ control, name: "slug" }) || "";
  const canCheckSlug = !!slug && slugify(slug).length > 0;
  const isSlugChecking =
    canCheckSlug && slug !== league.slug && slugAvailability.value !== slug;
  const hasSlugConflict =
    canCheckSlug &&
    slug !== league.slug &&
    slugAvailability.value === slug &&
    slugAvailability.status === "conflict";

  useEffect(() => {
    if (!canCheckSlug || slug === league.slug) {
      slugRequestRef.current += 1;
      return;
    }

    const requestId = ++slugRequestRef.current;

    const timeoutId = window.setTimeout(async () => {
      const result = await checkLeagueSlugAvailability(
        league.eventId,
        slug,
        league.eventId,
      );

      if (slugRequestRef.current !== requestId) {
        return;
      }

      if (!result.success) {
        setSlugAvailability({
          value: slug,
          status: "available",
        });
        return;
      }

      setSlugAvailability({
        value: slug,
        status: result.data?.available ? "available" : "conflict",
      });
    }, 400);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [canCheckSlug, slug, league.eventId, league.slug]);

  // Auto-generate slug from name if not manually modified
  useEffect(() => {
    if (!isSlugModified && name !== league.name) {
      setValue("slug", slugify(name), {
        shouldValidate: true,
      });
    }
  }, [name, isSlugModified, setValue, league.name]);

  // Notify parent about loading state
  useEffect(() => {
    onLoadingChange?.(isPending);
  }, [isPending, onLoadingChange]);

  // Notify parent about validation state
  const isFormValid = isValid && !isSlugChecking && !hasSlugConflict;

  useEffect(() => {
    onValidationChange?.(isFormValid);
  }, [isFormValid, onValidationChange]);

  useEffect(() => {
    let valid = false;

    if (currentStep === 0) {
      valid = true;
    } else if (currentStep === 1) {
      valid = true;
    } else if (currentStep === 2) {
      const values = {
        name: name.trim(),
        slug: slug.trim(),
      };
      valid = values.name.length >= 2 && values.slug.length >= 2;
      if (valid) {
        valid = !isSlugChecking && !hasSlugConflict;
      }
    } else if (currentStep === 3) {
      valid = allowedFormats.length > 0;
    }

    onStepValidationChange?.(valid);
  }, [
    currentStep,
    name,
    slug,
    isSlugChecking,
    hasSlugConflict,
    allowedFormats.length,
    onStepValidationChange,
  ]);

  const matchFormatOptions = MATCH_FORMATS.map((value) => ({
    value,
    label: t(`AddLeague.matchFormats.options.${value}.label`),
    description: t(`AddLeague.matchFormats.options.${value}.description`),
  }));

  const toggleMatchFormat = (format: string) => {
    const values = getValues("allowedFormats") || [];
    const nextValues = values.includes(format)
      ? values.filter((item) => item !== format)
      : [...values, format];

    setValue("allowedFormats", nextValues, { shouldValidate: true });
  };

  const onSubmit = async (values: EditLeagueValues) => {
    startTransition(async () => {
      const isElo = values.ratingSystem === "ELO";
      const cfg = league.config as Record<string, number>;

      const config = isElo
        ? {
            initialElo: values.initialElo ?? cfg.initialElo ?? 1000,
            kFactor: values.kFactor ?? cfg.kFactor ?? 20,
            scoreRelevance: values.scoreRelevance ?? cfg.scoreRelevance ?? 0,
            inactivityDecay: values.inactivityDecay ?? cfg.inactivityDecay ?? 0,
            inactivityThresholdHours:
              values.inactivityThresholdHours ??
              cfg.inactivityThresholdHours ??
              120,
            inactivityDecayFloor:
              values.inactivityDecayFloor ?? cfg.inactivityDecayFloor ?? 1000,
          }
        : {
            pointsPerWin: values.pointsPerWin ?? cfg.pointsPerWin ?? 3,
            pointsPerDraw: values.pointsPerDraw ?? cfg.pointsPerDraw ?? 1,
            pointsPerLoss: values.pointsPerLoss ?? cfg.pointsPerLoss ?? 0,
          };

      const result = await updateLeague(league.eventId, {
        name: values.name,
        slug: values.slug,
        allowDraw: values.allowDraw,
        description: values.description ?? null,
        allowedFormats: values.allowedFormats,
        config,
      });

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
      {/* Step 1: Game */}
      {currentStep === 0 && (
        <section className="animate-in fade-in slide-in-from-right-4 space-y-6 duration-500">
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-white">
              {t("AddLeague.gameSelect.label")}
            </h3>
            <p className="text-sm text-white/50">{league.game?.name}</p>
          </div>

          <div className="relative flex h-45 flex-col items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-white/2 p-6 transition-all">
            <div className="animate-in fade-in zoom-in-95 flex w-full flex-col gap-4 duration-300">
              <div className="flex items-center gap-4">
                <div className="relative size-16 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-2xl">
                  {league.game?.thumbnailImageUrl ? (
                    <Image
                      src={league.game.thumbnailImageUrl}
                      alt={league.game?.name ?? ""}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center">
                      <Trophy className="size-6 text-white/10" />
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="text-lg leading-tight font-bold text-white">
                    {league.game?.name}
                  </h4>
                  <p className="text-primary text-[10px] font-bold tracking-[0.2em] uppercase">
                    {league.game?.slug}
                  </p>
                </div>
              </div>
              <p className="line-clamp-3 text-sm leading-relaxed text-white/50">
                {(league.game as { description?: string | null } | undefined)
                  ?.description || "No description."}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Step 3: General Data */}
      {currentStep === 2 && (
        <section className="animate-in fade-in slide-in-from-right-4 space-y-6 duration-500">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <LabelTooltip label={t("AddLeague.name.label")} required />
              <input
                type="text"
                {...register("name")}
                placeholder={t("AddLeague.name.placeholder")}
                className={cn(
                  "field-base",
                  errors.name ? "field-border-error" : "field-border-default",
                )}
              />
              {errors.name && (
                <p className="field-error-text">{errors.name.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <LabelTooltip
                label={t("AddLeague.slug.label")}
                tooltip={t("AddLeague.slug.tooltip")}
                required
              />
              <div className="relative">
                <input
                  type="text"
                  {...register("slug")}
                  onChange={(e) => {
                    setValue("slug", slugify(e.target.value), {
                      shouldValidate: true,
                    });
                    setIsSlugModified(true);
                  }}
                  placeholder={t("AddLeague.slug.placeholder")}
                  className={cn(
                    "field-with-icon",
                    errors.slug || hasSlugConflict
                      ? "field-border-error"
                      : "field-border-default",
                  )}
                />
                {isSlugChecking ? (
                  <LoaderCircle className="absolute top-1/2 right-4 size-4 -translate-y-1/2 animate-spin text-white/20" />
                ) : canCheckSlug && slug !== league.slug && !errors.slug ? (
                  hasSlugConflict ? (
                    <X className="text-danger absolute top-1/2 right-4 size-4 -translate-y-1/2" />
                  ) : (
                    <Check className="text-success absolute top-1/2 right-4 size-4 -translate-y-1/2" />
                  )
                ) : null}
              </div>
              {errors.slug && (
                <p className="field-error-text">{errors.slug.message}</p>
              )}
              {!errors.slug && hasSlugConflict && (
                <p className="field-error-text">{t("AddLeague.slug.taken")}</p>
              )}
            </div>

            <div className="col-span-full flex flex-col gap-2">
              <LabelTooltip label={t("AddLeague.descriptionField.label")} />
              <textarea
                {...register("description")}
                placeholder={t("AddLeague.descriptionField.placeholder")}
                className={cn(
                  "field-textarea custom-scrollbar min-h-20",
                  errors.description
                    ? "field-border-error"
                    : "field-border-default",
                )}
              />
              {errors.description && (
                <p className="field-error-text">{errors.description.message}</p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Step 2: Rating Logic */}
      {currentStep === 1 && (
        <section className="animate-in fade-in slide-in-from-right-4 space-y-6 duration-500">
          <div className="flex flex-col gap-10">
            {/* System Selector - Full Width Row */}
            <div className="flex flex-col gap-4">
              <LabelTooltip label={t("AddLeague.ratingSystem.label")} />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  disabled
                  className={cn(
                    "flex cursor-not-allowed flex-col items-start gap-2 rounded-2xl border p-4 text-left transition-all",
                    ratingSystem === "ELO"
                      ? "border-primary/50 bg-primary/10 text-primary shadow-primary/10 shadow-lg"
                      : "border-white/5 bg-white/5 text-white/40 opacity-40",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Trophy className="size-4" />
                    <span className="text-sm font-bold">
                      {t("AddLeague.ratingSystem.elo")}
                    </span>
                  </div>
                  <span className="text-xs leading-relaxed text-white/50">
                    {t("AddLeague.ratingSystem.elo_description")}
                  </span>
                </button>
                <button
                  type="button"
                  disabled
                  className={cn(
                    "flex cursor-not-allowed flex-col items-start gap-2 rounded-2xl border p-4 text-left transition-all",
                    ratingSystem === "POINTS"
                      ? "border-primary/50 bg-primary/10 text-primary shadow-primary/10 shadow-lg"
                      : "border-white/5 bg-white/5 text-white/40 opacity-40",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Hash className="size-4" />
                    <span className="text-sm font-bold">
                      {t("AddLeague.ratingSystem.points")}
                    </span>
                  </div>
                  <span className="text-xs leading-relaxed text-white/50">
                    {t("AddLeague.ratingSystem.points_description")}
                  </span>
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
                  {ratingSystem === "ELO" ? (
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
                {ratingSystem === "ELO" && (
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
                              tooltip={t(
                                "AddLeague.inactivityThreshold.tooltip",
                              )}
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
                  <h4 className="text-primary mb-4 flex items-center gap-2 text-sm font-bold">
                    <Zap className="size-4" />
                    {t("AddLeague.explanation.title")}
                  </h4>

                  <div className="space-y-5 text-xs leading-relaxed text-white/60">
                    <p className="font-medium text-white/80 italic">
                      {ratingSystem === "ELO"
                        ? t("AddLeague.explanation.elo.description")
                        : t("AddLeague.explanation.points.description")}
                    </p>

                    <div className="grid gap-3 pt-2">
                      {ratingSystem === "ELO" ? (
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
                                return t(
                                  "AddLeague.explanation.elo.relevance_5",
                                );
                              })()}
                            </span>
                          </div>

                          <EloMatchSimulator
                            scoreRelevance={scoreRelevance}
                            kFactor={kFactor}
                            initialElo={initialElo}
                          />

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
                              <div className="text-danger/50 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white/5">
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
                            <ArrowUpRight className="text-success size-4" />
                            <span className="text-white/80">
                              {t("AddLeague.explanation.points.win", {
                                amount: pointsPerWin || 0,
                              })}
                            </span>
                          </div>
                          {allowDraw && (
                            <div className="flex items-center gap-3">
                              <Equal className="text-warning size-4" />
                              <span className="text-white/80">
                                {t("AddLeague.explanation.points.draw", {
                                  amount: pointsPerDraw || 0,
                                })}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-3">
                            <ArrowDownRight className="text-danger size-4" />
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
      )}

      {/* Step 4: Match Formats */}
      {currentStep === 3 && (
        <section className="animate-in fade-in slide-in-from-right-4 space-y-8 duration-500">
          <LabelTooltip
            label={t("AddLeague.matchFormats.title")}
            tooltip={t("AddLeague.matchFormats.help")}
            required
          />

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {matchFormatOptions.map((option) => {
              const isSelected = allowedFormats.includes(option.value);

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => toggleMatchFormat(option.value)}
                  className={cn(
                    "flex flex-col items-start gap-2 rounded-2xl border p-4 text-left transition-all",
                    isSelected
                      ? "border-primary/50 bg-primary/10 text-primary shadow-primary/10 shadow-lg"
                      : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10",
                  )}
                >
                  <div className="flex w-full items-center justify-between gap-2">
                    <span className="text-sm font-bold">{option.label}</span>
                    {isSelected && <Check className="size-4" />}
                  </div>
                  <span className="text-xs text-white/50">
                    {option.description}
                  </span>
                </button>
              );
            })}
          </div>

          {allowedFormats.length === 0 && (
            <p className="text-danger text-xs">
              {t("AddLeague.matchFormats.required")}
            </p>
          )}
        </section>
      )}
    </form>
  );
}
