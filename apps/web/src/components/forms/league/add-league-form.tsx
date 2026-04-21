"use client";

import { useTransition, useState, useEffect, useRef, useMemo } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useAddLeagueSchema,
  type AddLeagueValues,
  LEAGUE_DEFAULT_SETTINGS,
} from "@/schemas/league";
import {
  Trophy,
  Swords,
  User,
  Users,
  Zap,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Equal,
  Activity,
  TrendingUp,
  Search,
  LoaderCircle,
  AlertTriangle,
  Check,
  X,
} from "lucide-react";
// Removido Popover import se não for usado em outro lugar, mas vou manter se necessário.
import { createLeague, checkLeagueSlugAvailability } from "@/actions/game";
import { getGamesSimple, type SimpleGame } from "@/actions/get-games";
import { toast } from "sonner";
import { useLocale, useTranslations } from "next-intl";
import { Slider } from "@/components/ui/slider";
import { LabelTooltip } from "@/components/ui/label-tooltip";
import { NumberInput } from "@/components/ui/number-input";
import { formatHoursDuration } from "@/lib/date-utils";
import { cn, slugify } from "@/lib/utils";
import { MATCH_FORMATS } from "@ares/core";
import { EloMatchSimulator } from "./elo-match-simulator";
import { TiptapEditor } from "@/components/ui/tiptap-editor";

interface AddLeagueFormProps {
  gameId: string;
  onSuccess: () => void;
  onLoadingChange?: (loading: boolean) => void;
  onValidationChange?: (isValid: boolean) => void;
  onStepValidationChange?: (isValid: boolean) => void;
  formId: string;
  currentStep: number;
  initialGame?: SimpleGame;
  isGameFixed?: boolean;
}

export function AddLeagueForm({
  gameId,
  onSuccess,
  onLoadingChange,
  onValidationChange,
  onStepValidationChange,
  formId,
  currentStep,
  initialGame,
  isGameFixed,
}: AddLeagueFormProps) {
  const t = useTranslations("Modals.AddLeague");
  const locale = useLocale();
  const schema = useAddLeagueSchema();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    formState: { errors, isValid, touchedFields },
  } = useForm<AddLeagueValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      gameId: gameId || undefined,
      gameName: undefined,
      name: "",
      slug: "",
      description: "",
      about: "",
      ratingSystem: "ELO",
      initialElo: LEAGUE_DEFAULT_SETTINGS.initialElo,
      allowDraw: false,
      kFactor: LEAGUE_DEFAULT_SETTINGS.kFactor,
      scoreRelevance: LEAGUE_DEFAULT_SETTINGS.scoreRelevance,
      inactivityDecay: LEAGUE_DEFAULT_SETTINGS.inactivityDecay,
      inactivityThresholdHours:
        LEAGUE_DEFAULT_SETTINGS.inactivityThresholdHours,
      inactivityDecayFloor: LEAGUE_DEFAULT_SETTINGS.inactivityDecayFloor,
      pointsPerWin: LEAGUE_DEFAULT_SETTINGS.pointsPerWin,
      pointsPerDraw: LEAGUE_DEFAULT_SETTINGS.pointsPerDraw,
      pointsPerLoss: LEAGUE_DEFAULT_SETTINGS.pointsPerLoss,
      allowedFormats: [...LEAGUE_DEFAULT_SETTINGS.allowedFormats],
    },
    mode: "onChange",
  });

  const watchGameId = useWatch({ control, name: "gameId" });
  const watchGameName = useWatch({ control, name: "gameName" });
  const watchName = useWatch({ control, name: "name" }) || "";
  const watchSlug = useWatch({ control, name: "slug" }) || "";
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

  const [participationMode, setParticipationMode] = useState<"SOLO" | "TEAM">(
    "SOLO",
  );
  const [eventType, setEventType] = useState<"LEAGUE" | "TOURNAMENT">("LEAGUE");
  const [isSlugModified, setIsSlugModified] = useState(false);
  const [games, setGames] = useState<SimpleGame[]>([]);
  const [isGamesLoading, setIsGamesLoading] = useState(false);
  const [slugAvailability, setSlugAvailability] = useState<{
    value: string;
    gameId: string | null;
    status: "idle" | "available" | "conflict";
  }>({
    value: "",
    gameId: null,
    status: "idle",
  });
  const [gameSearch, setGameSearch] = useState(initialGame?.name || "");
  const [selectedGame, setSelectedGame] = useState<SimpleGame | null>(
    initialGame || null,
  );
  const [showResults, setShowResults] = useState(false);
  const slugRequestRef = useRef(0);

  const hasExactMatch = useMemo(() => {
    if (!gameSearch) return false;
    return games.some(
      (g) => g.name.toLowerCase().trim() === gameSearch.toLowerCase().trim(),
    );
  }, [games, gameSearch]);

  const hasInitialized = useRef(!!initialGame);

  // Load games for step 1
  useEffect(() => {
    // Avoid fetching if we already have the initial game and search matches
    if (
      initialGame &&
      gameSearch === initialGame.name &&
      !hasInitialized.current
    ) {
      hasInitialized.current = true;
      return;
    }

    const fetchGames = async () => {
      setIsGamesLoading(true);
      const result = await getGamesSimple(gameSearch);
      if (result.success && result.data) {
        setGames(result.data);

        // Initial load if gameId is provided and we haven't initialized yet
        if (gameId && result.data.length > 0 && !hasInitialized.current) {
          const g = result.data.find((x) => x.id === gameId);
          if (g) {
            setSelectedGame(g);
            setGameSearch(g.name);
            hasInitialized.current = true;
            // Synchronize form immediately
            setValue("gameId", g.id, { shouldValidate: true });
            setValue("gameName", undefined, { shouldValidate: true });
          }
        }
      }

      setIsGamesLoading(false);
    };
    fetchGames();
  }, [
    gameSearch,
    gameId,
    setValue,
    setSelectedGame,
    setGameSearch,
    initialGame,
  ]);

  // Sync validation state when game selection or search changes (refined to avoid redundant renders)
  useEffect(() => {
    if (selectedGame) {
      setValue("gameId", selectedGame.id, { shouldValidate: true });
      setValue("gameName", undefined, { shouldValidate: true });
    } else if (gameSearch && !hasExactMatch && !isGamesLoading) {
      // If no exact match and not loading, we treat it as a potential new game
      setValue("gameId", undefined, { shouldValidate: true });
      setValue("gameName", gameSearch, { shouldValidate: true });
    } else {
      setValue("gameId", undefined, { shouldValidate: true });
      setValue("gameName", undefined, { shouldValidate: true });
    }
  }, [selectedGame, gameSearch, hasExactMatch, isGamesLoading, setValue]);

  // Auto-generate slug from name
  useEffect(() => {
    if (!isSlugModified && watchName) {
      setValue("slug", slugify(watchName), {
        shouldValidate: true,
      });
    }
  }, [watchName, isSlugModified, setValue]);

  const canCheckSlug =
    !!watchGameId &&
    !!watchSlug &&
    schema.shape.slug.safeParse(watchSlug).success;
  const isSlugChecking =
    canCheckSlug &&
    (slugAvailability.value !== watchSlug ||
      slugAvailability.gameId !== watchGameId);
  const hasSlugConflict =
    canCheckSlug &&
    slugAvailability.value === watchSlug &&
    slugAvailability.gameId === watchGameId &&
    slugAvailability.status === "conflict";

  useEffect(() => {
    if (!canCheckSlug) {
      slugRequestRef.current += 1;
      return;
    }

    const requestId = ++slugRequestRef.current;

    const timeoutId = window.setTimeout(async () => {
      const result = await checkLeagueSlugAvailability(watchGameId, watchSlug);

      if (slugRequestRef.current !== requestId) {
        return;
      }

      if (!result.success) {
        setSlugAvailability({
          value: watchSlug,
          gameId: watchGameId,
          status: "available",
        });
        return;
      }

      setSlugAvailability({
        value: watchSlug,
        gameId: watchGameId,
        status: result.data?.available ? "available" : "conflict",
      });
    }, 400);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [canCheckSlug, watchGameId, watchSlug]);

  // Notify parent about loading state
  useEffect(() => {
    onLoadingChange?.(isPending);
  }, [isPending, onLoadingChange]);

  // Notify parent about validation state
  const isFormValid = isValid && !isSlugChecking && !hasSlugConflict;

  useEffect(() => {
    onValidationChange?.(isFormValid);
  }, [isFormValid, onValidationChange]);

  // Per-step validation logic
  useEffect(() => {
    const checkStepValidity = async () => {
      let isStepValid = false;
      if (currentStep === 0) {
        isStepValid = !!watchGameId || !!watchGameName;
      } else if (currentStep === 1) {
        isStepValid = true;
      } else if (currentStep === 2) {
        isStepValid = allowedFormats.length > 0;
      } else if (currentStep === 3) {
        // About step is always valid (optional rich text)
        isStepValid = true;
      } else if (currentStep === 4) {
        // General step: validate name/slug
        const values = getValues();
        const parseResult = schema.safeParse(values);

        if (parseResult.success) {
          isStepValid = true;
        } else {
          const step5Fields = ["name", "slug"];
          const hasStep5Errors = parseResult.error.issues.some((issue) =>
            step5Fields.includes(issue.path[0] as string),
          );
          isStepValid = !hasStep5Errors;
        }

        if (isStepValid) {
          isStepValid = !isSlugChecking && !hasSlugConflict;
        }
      }
      onStepValidationChange?.(isStepValid);
    };

    checkStepValidity();
  }, [
    currentStep,
    watchGameId,
    watchName,
    watchSlug,
    onStepValidationChange,
    watchGameName,
    getValues,
    hasSlugConflict,
    isSlugChecking,
    schema,
    allowedFormats.length,
  ]);

  const matchFormatOptions = MATCH_FORMATS.map((value) => ({
    value,
    label: t(`matchFormats.options.${value}.label`),
    description: t(`matchFormats.options.${value}.description`),
  }));

  const toggleMatchFormat = (format: string) => {
    const values = getValues("allowedFormats") || [];
    const nextValues = values.includes(format)
      ? values.filter((item) => item !== format)
      : [...values, format];

    setValue("allowedFormats", nextValues, { shouldValidate: true });
  };

  const onSubmit = async (values: AddLeagueValues) => {
    if (isSlugChecking || hasSlugConflict) {
      return;
    }

    startTransition(async () => {
      const isElo = values.ratingSystem === "ELO";

      const eloConfig = isElo
        ? {
            initialElo: values.initialElo ?? LEAGUE_DEFAULT_SETTINGS.initialElo,
            kFactor: values.kFactor ?? LEAGUE_DEFAULT_SETTINGS.kFactor,
            scoreRelevance:
              values.scoreRelevance ?? LEAGUE_DEFAULT_SETTINGS.scoreRelevance,
            inactivityDecay:
              values.inactivityDecay ?? LEAGUE_DEFAULT_SETTINGS.inactivityDecay,
            inactivityThresholdHours:
              values.inactivityThresholdHours ??
              LEAGUE_DEFAULT_SETTINGS.inactivityThresholdHours,
            inactivityDecayFloor:
              values.inactivityDecayFloor ??
              LEAGUE_DEFAULT_SETTINGS.inactivityDecayFloor,
          }
        : {
            pointsPerWin:
              values.pointsPerWin ?? LEAGUE_DEFAULT_SETTINGS.pointsPerWin,
            pointsPerDraw:
              values.pointsPerDraw ?? LEAGUE_DEFAULT_SETTINGS.pointsPerDraw,
            pointsPerLoss:
              values.pointsPerLoss ?? LEAGUE_DEFAULT_SETTINGS.pointsPerLoss,
          };

      const result = await createLeague({
        gameId: values.gameId,
        gameName: values.gameName,
        name: values.name,
        slug: values.slug,
        description: values.description ?? null,
        about: values.about ?? null,
        participationMode,
        classificationSystem: isElo ? "ELO" : "POINTS",
        allowDraw: values.allowDraw,
        allowedFormats: values.allowedFormats,
        config: eloConfig,
      });

      if (result.success) {
        toast.success(t("success"));
        onSuccess();
      } else {
        toast.error(result.error || t("error"));
      }
    });
  };

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-10">
      {/* Step 1: Game Selection */}
      {currentStep === 0 && (
        <section className="animate-in fade-in slide-in-from-right-4 space-y-8 duration-500">
          <div className="flex flex-col gap-6">
            <LabelTooltip label={t("gameSelect.label")} required />

            <div className="relative">
              <div className="relative">
                <Search className="absolute top-1/2 left-4 size-5 -translate-y-1/2 text-white/20" />
                <input
                  type="text"
                  placeholder={t("gameSelect.placeholder")}
                  value={gameSearch}
                  onFocus={() => setShowResults(true)}
                  onChange={(e) => {
                    setGameSearch(e.target.value);
                    setShowResults(true);
                    if (selectedGame) setSelectedGame(null);
                  }}
                  disabled={isGameFixed}
                  className={cn(
                    "field-base py-3.5 pr-4 pl-12",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    errors.gameId || errors.gameName
                      ? "field-border-error"
                      : "field-border-default",
                  )}
                />
                {isGamesLoading && (
                  <LoaderCircle className="text-primary/40 absolute top-1/2 right-4 size-4 -translate-y-1/2 animate-spin" />
                )}
              </div>

              {/* Resultados do Dropdown */}
              {gameSearch &&
                !selectedGame &&
                showResults &&
                (games.length > 0 || !isGamesLoading) && (
                  <div className="glass-panel animate-in fade-in slide-in-from-top-2 absolute top-full left-0 z-50 mt-2 w-full overflow-hidden rounded-3xl border border-white/10 bg-black/60 shadow-2xl backdrop-blur-xl duration-200">
                    <div className="custom-scrollbar max-h-60 overflow-y-auto p-2">
                      {/* Opção de Criar Novo (sempre visível se não houver match exato) */}
                      {!hasExactMatch && !isGamesLoading && (
                        <button
                          type="button"
                          onClick={() => {
                            setShowResults(false);
                          }}
                          className="group flex w-full items-center gap-3 rounded-2xl p-3 text-left transition-all hover:bg-white/5"
                        >
                          <div className="border-primary/20 bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-lg border">
                            <Search className="size-4" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-primary text-sm font-bold">
                              {t("gameSelect.searchNew", { name: gameSearch })}
                            </span>
                            <span className="text-[10px] tracking-widest text-white/30 uppercase">
                              {t("gameSelect.newGameWarning")}
                            </span>
                          </div>
                        </button>
                      )}

                      {games.map((game) => (
                        <button
                          key={game.id}
                          type="button"
                          onClick={() => {
                            setSelectedGame(game);
                            setGameSearch(game.name);
                            setShowResults(false);
                          }}
                          className="group flex w-full items-center gap-3 rounded-2xl p-3 text-left transition-all hover:bg-white/5"
                        >
                          <div className="relative size-10 shrink-0 overflow-hidden rounded-lg border border-white/5 bg-black/40">
                            {game.thumbnailImageUrl ? (
                              <Image
                                src={game.thumbnailImageUrl}
                                alt={game.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex size-full items-center justify-center bg-white/5">
                                <Trophy className="size-4 text-white/20" />
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="group-hover:text-primary text-sm font-bold text-white transition-colors">
                              {game.name}
                            </span>
                            <span className="text-[10px] tracking-widest text-white/30 uppercase">
                              {game.slug}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
            </div>

            {/* Box de Preview ou Aviso */}
            <div className="relative flex h-45 flex-col items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-white/2 p-6 transition-all">
              {selectedGame ? (
                <div className="animate-in fade-in zoom-in-95 flex w-full flex-col gap-4 duration-300">
                  <div className="flex items-center gap-4">
                    {/* Note: Thumbnails are usually 460x215 */}
                    <div className="relative size-16 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-2xl">
                      {selectedGame.thumbnailImageUrl ? (
                        <Image
                          src={selectedGame.thumbnailImageUrl}
                          alt={selectedGame.name}
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
                        {selectedGame.name}
                      </h4>
                      <p className="text-primary text-[10px] font-bold tracking-[0.2em] uppercase">
                        {selectedGame.slug}
                      </p>
                    </div>
                  </div>
                  <p className="line-clamp-3 text-sm leading-relaxed text-white/50">
                    {selectedGame.description || t("gamePage.noDescription")}
                  </p>
                </div>
              ) : gameSearch &&
                !selectedGame &&
                !hasExactMatch &&
                !isGamesLoading ? (
                <div className="animate-in fade-in slide-in-from-bottom-4 flex w-full flex-col items-center justify-center gap-4 text-center duration-500">
                  <div className="bg-warning/10 text-warning flex size-12 items-center justify-center rounded-2xl">
                    <AlertTriangle className="size-6" />
                  </div>
                  <div className="w-full space-y-2">
                    <p className="text-sm font-bold tracking-wider text-white uppercase">
                      {t("gameSelect.newGameWarning")}
                    </p>
                    <p className="mx-auto max-w-110 text-xs leading-relaxed text-white/30">
                      {t("gameSelect.newGameInstructions")}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-4 text-center opacity-20">
                  <Trophy className="size-10 text-white" />
                  <p className="text-xs font-bold tracking-[0.3em] uppercase">
                    {t("gameSelect.placeholder")}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Step 4: About */}
      {currentStep === 3 && (
        <section className="animate-in fade-in slide-in-from-right-4 space-y-6 duration-500">
          <div className="flex flex-col gap-2">
            <LabelTooltip label={t("aboutField.label")} />
            <Controller
              name="about"
              control={control}
              render={({ field }) => (
                <TiptapEditor
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  placeholder={t("aboutField.placeholder")}
                />
              )}
            />
            <p className="text-xs text-white/30">{t("aboutField.hint")}</p>
          </div>
        </section>
      )}

      {/* Step 5: General Data */}
      {currentStep === 4 && (
        <section className="animate-in fade-in slide-in-from-right-4 space-y-8 duration-500">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <LabelTooltip label={t("name.label")} required />
              <input
                type="text"
                {...register("name")}
                placeholder={t("name.placeholder")}
                className={cn(
                  "field-base",
                  errors.name ? "field-border-error" : "field-border-default",
                )}
              />
              {errors.name && touchedFields.name && (
                <p className="field-error-text">{errors.name.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <LabelTooltip
                label={t("slug.label")}
                tooltip={t("slug.tooltip")}
                required
              />
              <div className="relative">
                <input
                  type="text"
                  {...register("slug")}
                  onChange={(e) => {
                    const sanitized = e.target.value
                      .toLowerCase()
                      .normalize("NFD")
                      .replace(/[\u0300-\u036f]/g, "")
                      .replace(/[^a-z0-9_-]/g, "");
                    setValue("slug", sanitized, {
                      shouldValidate: true,
                    });
                    setIsSlugModified(true);
                  }}
                  placeholder={t("slug.placeholder")}
                  className={cn(
                    "field-with-icon",
                    errors.slug || hasSlugConflict
                      ? "field-border-error"
                      : "field-border-default",
                  )}
                />
                {isSlugChecking ? (
                  <LoaderCircle className="absolute top-1/2 right-4 size-4 -translate-y-1/2 animate-spin text-white/20" />
                ) : canCheckSlug && !errors.slug ? (
                  hasSlugConflict ? (
                    <X className="text-danger absolute top-1/2 right-4 size-4 -translate-y-1/2" />
                  ) : (
                    <Check className="text-success absolute top-1/2 right-4 size-4 -translate-y-1/2" />
                  )
                ) : null}
              </div>
              {errors.slug && touchedFields.slug && (
                <p className="field-error-text">{errors.slug.message}</p>
              )}
              {!errors.slug && hasSlugConflict && (
                <p className="field-error-text">{t("slug.taken")}</p>
              )}
            </div>

            <div className="col-span-full flex flex-col gap-2">
              <LabelTooltip label={t("descriptionField.label")} />
              <textarea
                {...register("description")}
                placeholder={t("descriptionField.placeholder")}
                className={cn(
                  "field-textarea custom-scrollbar min-h-20",
                  errors.description
                    ? "field-border-error"
                    : "field-border-default",
                )}
              />
              {errors.description && touchedFields.description && (
                <p className="field-error-text">{errors.description.message}</p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Step 2: Type */}
      {currentStep === 1 && (
        <section className="animate-in fade-in slide-in-from-right-4 space-y-8 duration-500">
          <div className="flex flex-col gap-8">
            {/* Participation Mode */}
            <div className="flex flex-col gap-4">
              <LabelTooltip label={t("participationMode.label")} />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setParticipationMode("SOLO")}
                  className={cn(
                    "flex flex-col items-start gap-2 rounded-2xl border p-4 text-left transition-all",
                    participationMode === "SOLO"
                      ? "border-primary/50 bg-primary/10 text-primary shadow-primary/10 shadow-lg"
                      : "border-white/5 bg-white/5 text-white/40 hover:bg-white/10",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <User className="size-4" />
                    <span className="text-sm font-bold">
                      {t("participationMode.solo")}
                    </span>
                  </div>
                  <span className="text-xs leading-relaxed text-white/50">
                    {t("participationMode.solo_description")}
                  </span>
                </button>
                <button
                  type="button"
                  disabled
                  className="flex cursor-not-allowed flex-col items-start gap-2 rounded-2xl border border-white/5 bg-white/5 p-4 text-left opacity-50"
                >
                  <div className="flex w-full items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Users className="size-4 text-white/40" />
                      <span className="text-sm font-bold text-white/40">
                        {t("participationMode.team")}
                      </span>
                    </div>
                    <span className="text-[9px] font-bold tracking-[0.2em] text-white/20 uppercase">
                      {t("soon")}
                    </span>
                  </div>
                  <span className="text-xs leading-relaxed text-white/30">
                    {t("participationMode.team_description")}
                  </span>
                </button>
              </div>
            </div>

            {/* Event Type */}
            <div className="flex flex-col gap-4">
              <LabelTooltip label={t("eventType.label")} />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setEventType("LEAGUE")}
                  className={cn(
                    "flex flex-col items-start gap-2 rounded-2xl border p-4 text-left transition-all",
                    eventType === "LEAGUE"
                      ? "border-primary/50 bg-primary/10 text-primary shadow-primary/10 shadow-lg"
                      : "border-white/5 bg-white/5 text-white/40 hover:bg-white/10",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Trophy className="size-4" />
                    <span className="text-sm font-bold">
                      {t("eventType.league")}
                    </span>
                  </div>
                  <span className="text-xs leading-relaxed text-white/50">
                    {t("eventType.league_description")}
                  </span>
                </button>
                <button
                  type="button"
                  disabled
                  className="flex cursor-not-allowed flex-col items-start gap-2 rounded-2xl border border-white/5 bg-white/5 p-4 text-left opacity-50"
                >
                  <div className="flex w-full items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Swords className="size-4 text-white/40" />
                      <span className="text-sm font-bold text-white/40">
                        {t("eventType.tournament")}
                      </span>
                    </div>
                    <span className="text-[9px] font-bold tracking-[0.2em] text-white/20 uppercase">
                      {t("soon")}
                    </span>
                  </div>
                  <span className="text-xs leading-relaxed text-white/30">
                    {t("eventType.tournament_description")}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Step 3: Format */}
      {currentStep === 2 && (
        <section className="animate-in fade-in slide-in-from-right-4 space-y-8 duration-500">
          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-4">
              <LabelTooltip label={t("ratingSystem.label")} />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setValue("ratingSystem", "ELO")}
                  className={cn(
                    "flex flex-col items-start gap-2 rounded-2xl border p-4 text-left transition-all",
                    ratingSystem === "ELO"
                      ? "border-primary/50 bg-primary/10 text-primary shadow-primary/10 shadow-lg"
                      : "border-white/5 bg-white/5 text-white/40 hover:bg-white/10",
                  )}
                >
                  <span className="text-sm font-bold">
                    {t("ratingSystem.elo")}
                  </span>
                  <span className="text-xs leading-relaxed text-white/50">
                    {t("ratingSystem.elo_description")}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setValue("ratingSystem", "POINTS")}
                  className={cn(
                    "flex flex-col items-start gap-2 rounded-2xl border p-4 text-left transition-all",
                    ratingSystem === "POINTS"
                      ? "border-primary/50 bg-primary/10 text-primary shadow-primary/10 shadow-lg"
                      : "border-white/5 bg-white/5 text-white/40 hover:bg-white/10",
                  )}
                >
                  <span className="text-sm font-bold">
                    {t("ratingSystem.points")}
                  </span>
                  <span className="text-xs leading-relaxed text-white/50">
                    {t("ratingSystem.points_description")}
                  </span>
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <LabelTooltip
                label={t("matchFormats.title")}
                tooltip={t("matchFormats.help")}
                required
              />

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {matchFormatOptions.map((option) => {
                  const isSelected = allowedFormats.includes(option.value);

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => toggleMatchFormat(option.value)}
                      className={cn(
                        "flex items-center justify-between gap-1.5 rounded-xl border px-3 py-2 text-left transition-all",
                        isSelected
                          ? "border-primary/50 bg-primary/10 text-primary shadow-primary/10 shadow-lg"
                          : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10",
                      )}
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-bold">
                          {option.label}
                        </span>
                        <span className="text-[10px] leading-tight text-white/40">
                          {option.description}
                        </span>
                      </div>
                      {isSelected && <Check className="size-3 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {allowedFormats.length === 0 && (
                <p className="text-danger text-xs">
                  {t("matchFormats.required")}
                </p>
              )}
            </div>

            <div className="grid gap-8 md:grid-cols-5">
              <div className="space-y-8 md:col-span-2">
                <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/2 p-4">
                  <LabelTooltip
                    label={t("allowDraw.label")}
                    tooltip={t("allowDraw.tooltip")}
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
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                          <LabelTooltip label={t("initialElo.label")} />
                          <Controller
                            name="initialElo"
                            control={control}
                            render={({ field }) => (
                              <NumberInput
                                value={field.value || 0}
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
                                value={field.value || 0}
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
                              value={field.value || 0}
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

                      <div className="border-l-primary/30 mt-2 space-y-4 rounded-2xl border border-white/5 bg-white/2 p-5 text-left">
                        <div className="flex items-center gap-2 text-white/40">
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
                                  value={field.value || 0}
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
                                      value={field.value || 0}
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
                                      value={field.value || 0}
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
                          labelClassName="text-[10px] font-bold tracking-wider text-white/40 uppercase"
                          required
                        />
                        <Controller
                          name="pointsPerWin"
                          control={control}
                          render={({ field }) => (
                            <NumberInput
                              value={field.value || 0}
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
                            labelClassName="text-[10px] font-bold tracking-wider text-white/40 uppercase"
                            required
                          />
                          <Controller
                            name="pointsPerDraw"
                            control={control}
                            render={({ field }) => (
                              <NumberInput
                                value={field.value || 0}
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
                          labelClassName="text-[10px] font-bold tracking-wider text-white/40 uppercase"
                          required
                        />
                        <Controller
                          name="pointsPerLoss"
                          control={control}
                          render={({ field }) => (
                            <NumberInput
                              value={field.value || 0}
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

              <div className="space-y-6 md:col-span-3">
                <div className="border-primary/20 bg-primary/3 shadow-primary/5 relative overflow-hidden rounded-3xl border p-6 shadow-2xl">
                  <h4 className="text-primary mb-4 flex items-center gap-2 text-sm font-bold">
                    <Zap className="size-4" />
                    {t("explanation.title")}
                  </h4>
                  <div className="space-y-5 text-xs leading-relaxed text-white/60">
                    <p className="font-medium text-white/80 italic">
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
                                ? t("explanation.elo.draws_enabled")
                                : t("explanation.elo.draws_disabled")}
                            </span>
                          </div>
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
                              <div className="text-danger/50 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white/5">
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
                            <span className="text-white/80">
                              {t("explanation.points.win", {
                                amount: pointsPerWin || 0,
                              })}
                            </span>
                          </div>
                          {allowDraw && (
                            <div className="flex items-center gap-3">
                              <Equal className="text-warning size-4" />
                              <span className="text-white/80">
                                {t("explanation.points.draw", {
                                  amount: pointsPerDraw || 0,
                                })}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-3">
                            <ArrowDownRight className="text-danger size-4" />
                            <span className="text-white/80">
                              {t("explanation.points.loss", {
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
    </form>
  );
}
