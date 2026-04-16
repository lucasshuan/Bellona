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
  Zap,
  Clock,
  Hash,
  ArrowUpRight,
  ArrowDownRight,
  Equal,
  Activity,
  TrendingUp,
  Search,
  LoaderCircle,
  AlertTriangle,
} from "lucide-react";
// Removido Popover import se não for usado em outro lugar, mas vou manter se necessário.
import { addLeague } from "@/actions/game";
import { getGamesSimple, type SimpleGame } from "@/actions/get-games";
import { toast } from "sonner";
import { useLocale, useTranslations } from "next-intl";
import { Slider } from "@/components/ui/slider";
import { LabelTooltip } from "@/components/ui/label-tooltip";
import { DateInput } from "@/components/ui/date-input";
import { NumberInput } from "@/components/ui/number-input";
import { formatHoursDuration } from "@/lib/date-utils";
import { cn } from "@/lib/utils";

interface AddLeagueFormProps {
  gameId: string;
  onSuccess: () => void;
  onLoadingChange?: (loading: boolean) => void;
  onValidationChange?: (isValid: boolean) => void;
  onStepValidationChange?: (isValid: boolean) => void;
  formId: string;
  currentStep: number;
  initialGame?: SimpleGame;
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
    trigger,
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
      startDate: "",
      endDate: "",
      ratingSystem: "elo",
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
    },
    mode: "onChange",
  });

  const watchGameId = useWatch({ control, name: "gameId" });
  const watchGameName = useWatch({ control, name: "gameName" });
  const watchName = useWatch({ control, name: "name" }) || "";
  const watchSlug = useWatch({ control, name: "slug" }) || "";
  const watchStartDate = useWatch({ control, name: "startDate" }) || "";
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

  const [isSlugModified, setIsSlugModified] = useState(false);
  const [games, setGames] = useState<SimpleGame[]>([]);
  const [isGamesLoading, setIsGamesLoading] = useState(false);
  const [gameSearch, setGameSearch] = useState(initialGame?.name || "");
  const [selectedGame, setSelectedGame] = useState<SimpleGame | null>(
    initialGame || null,
  );
  const [showResults, setShowResults] = useState(false);

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
      setValue("slug", watchName.toLowerCase().replace(/[^a-z0-9-]/g, "-"), {
        shouldValidate: true,
      });
    }
  }, [watchName, isSlugModified, setValue]);

  // Notify parent about loading state
  useEffect(() => {
    onLoadingChange?.(isPending);
  }, [isPending, onLoadingChange]);

  // Notify parent about validation state
  useEffect(() => {
    onValidationChange?.(isValid);
  }, [isValid, onValidationChange]);

  // Per-step validation logic
  useEffect(() => {
    const checkStepValidity = async () => {
      let isStepValid = false;
      if (currentStep === 0) {
        isStepValid = !!watchGameId || !!watchGameName;
      } else if (currentStep === 1) {
        // Silent validation for Step 2 fields using the schema
        const values = getValues();
        const parseResult = schema.safeParse(values);

        if (parseResult.success) {
          isStepValid = true;
        } else {
          const step2Fields = ["name", "slug", "startDate"];
          const hasStep2Errors = parseResult.error.issues.some((issue) =>
            step2Fields.includes(issue.path[0] as string),
          );
          isStepValid = !hasStep2Errors;
        }
      } else if (currentStep === 2) {
        isStepValid = true; // Step 3 has defaults
      }
      onStepValidationChange?.(isStepValid);
    };

    checkStepValidity();
  }, [
    currentStep,
    watchGameId,
    watchName,
    watchSlug,
    watchStartDate,
    onStepValidationChange,
    trigger,
    watchGameName,
    getValues,
    schema,
  ]);

  const onSubmit = async (values: AddLeagueValues) => {
    startTransition(async () => {
      const isElo = values.ratingSystem === "elo";

      const result = await addLeague({
        ...values,
        description: values.description ?? null,
        initialElo: isElo
          ? (values.initialElo ?? LEAGUE_DEFAULT_SETTINGS.initialElo)
          : LEAGUE_DEFAULT_SETTINGS.initialElo,
        kFactor: isElo
          ? (values.kFactor ?? LEAGUE_DEFAULT_SETTINGS.kFactor)
          : LEAGUE_DEFAULT_SETTINGS.kFactor,
        scoreRelevance: isElo
          ? (values.scoreRelevance ?? LEAGUE_DEFAULT_SETTINGS.scoreRelevance)
          : LEAGUE_DEFAULT_SETTINGS.scoreRelevance,
        inactivityDecay: isElo
          ? (values.inactivityDecay ?? LEAGUE_DEFAULT_SETTINGS.inactivityDecay)
          : LEAGUE_DEFAULT_SETTINGS.inactivityDecay,
        inactivityThresholdHours: isElo
          ? (values.inactivityThresholdHours ??
            LEAGUE_DEFAULT_SETTINGS.inactivityThresholdHours)
          : LEAGUE_DEFAULT_SETTINGS.inactivityThresholdHours,
        inactivityDecayFloor: isElo
          ? (values.inactivityDecayFloor ??
            LEAGUE_DEFAULT_SETTINGS.inactivityDecayFloor)
          : LEAGUE_DEFAULT_SETTINGS.inactivityDecayFloor,
        pointsPerWin: !isElo
          ? (values.pointsPerWin ?? LEAGUE_DEFAULT_SETTINGS.pointsPerWin)
          : LEAGUE_DEFAULT_SETTINGS.pointsPerWin,
        pointsPerDraw: !isElo
          ? (values.pointsPerDraw ?? LEAGUE_DEFAULT_SETTINGS.pointsPerDraw)
          : LEAGUE_DEFAULT_SETTINGS.pointsPerDraw,
        pointsPerLoss: !isElo
          ? (values.pointsPerLoss ?? LEAGUE_DEFAULT_SETTINGS.pointsPerLoss)
          : LEAGUE_DEFAULT_SETTINGS.pointsPerLoss,
        startDate: values.startDate ? new Date(values.startDate) : null,
        endDate: values.endDate ? new Date(values.endDate) : null,
      });

      if (result.success) {
        toast.success(t("success"));
        onSuccess();
      } else {
        toast.error(result.error || t("error"));
      }
    });
  };

  const today = new Date().toISOString().split("T")[0];

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
                  className={cn(
                    "focus:border-primary/50 focus:ring-primary/10 w-full rounded-2xl border bg-white/5 py-3.5 pr-4 pl-12 text-sm text-white transition-all outline-none placeholder:text-white/20 focus:bg-white/[0.07] focus:ring-4",
                    errors.gameId || errors.gameName
                      ? "border-red-500/50"
                      : "border-white/10",
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
            <div className="relative flex h-[180px] flex-col items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-white/2 p-6 transition-all">
              <div className="bg-primary/5 absolute inset-0 -z-10 blur-3xl" />

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
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
                    <AlertTriangle className="size-6" />
                  </div>
                  <div className="w-full space-y-2">
                    <p className="text-sm font-bold tracking-wider text-white uppercase">
                      {t("gameSelect.newGameWarning")}
                    </p>
                    <p className="mx-auto max-w-[440px] text-xs leading-relaxed text-white/30">
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

      {/* Step 2: General Data */}
      {currentStep === 1 && (
        <section className="animate-in fade-in slide-in-from-right-4 space-y-8 duration-500">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <LabelTooltip label={t("name.label")} required />
              <input
                type="text"
                {...register("name")}
                placeholder={t("name.placeholder")}
                className={cn(
                  "focus:border-primary/50 focus:ring-primary/10 w-full rounded-2xl border bg-white/5 px-5 py-3 text-sm text-white transition-all outline-none placeholder:text-white/20 focus:bg-white/[0.07] focus:ring-4",
                  errors.name ? "border-red-500/50" : "border-white/10",
                )}
              />
              {errors.name && touchedFields.name && (
                <p className="ml-1 text-xs text-red-400">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <LabelTooltip
                label={t("slug.label")}
                tooltip={t("slug.tooltip")}
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
                placeholder={t("slug.placeholder")}
                className={cn(
                  "focus:border-primary/50 focus:ring-primary/10 w-full rounded-2xl border bg-white/5 px-5 py-3 text-sm text-white transition-all outline-none placeholder:text-white/20 focus:bg-white/[0.07] focus:ring-4",
                  errors.slug ? "border-red-500/50" : "border-white/10",
                )}
              />
              {errors.slug && touchedFields.slug && (
                <p className="ml-1 text-xs text-red-400">
                  {errors.slug.message}
                </p>
              )}
            </div>

            <div className="col-span-full flex flex-col gap-2">
              <LabelTooltip label={t("descriptionField.label")} />
              <textarea
                {...register("description")}
                placeholder={t("descriptionField.placeholder")}
                className={cn(
                  "focus:border-primary/50 focus:ring-primary/10 min-h-[80px] w-full rounded-2xl border bg-white/5 px-5 py-3 text-sm text-white transition-all outline-none placeholder:text-white/20 focus:bg-white/[0.07] focus:ring-4",
                  errors.description ? "border-red-500/50" : "border-white/10",
                )}
              />
              {errors.description && touchedFields.description && (
                <p className="ml-1 text-xs text-red-400">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <LabelTooltip label={t("dates.start.label")} required />
              <Controller
                name="startDate"
                control={control}
                render={({ field }) => (
                  <DateInput
                    value={field.value}
                    onChange={field.onChange}
                    min={today}
                    placeholder={t("dates.start.placeholder")}
                  />
                )}
              />
              {errors.startDate && touchedFields.startDate && (
                <p className="ml-1 text-xs text-red-400">
                  {errors.startDate.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <LabelTooltip label={t("dates.end.label")} />
              <Controller
                name="endDate"
                control={control}
                render={({ field }) => (
                  <DateInput
                    value={field.value || ""}
                    onChange={field.onChange}
                    min={watchStartDate || today}
                    placeholder={t("dates.end.placeholder")}
                  />
                )}
              />
            </div>
          </div>
        </section>
      )}

      {/* Step 3: Format Logic */}
      {currentStep === 2 && (
        <section className="animate-in fade-in slide-in-from-right-4 space-y-8 duration-500">
          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-4">
              <LabelTooltip label={t("ratingSystem.label")} />
              <div className="grid grid-cols-2 gap-3 sm:w-1/2">
                <button
                  type="button"
                  onClick={() => setValue("ratingSystem", "elo")}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-2xl border p-4 text-sm font-bold transition-all",
                    ratingSystem === "elo"
                      ? "border-primary/50 bg-primary/10 text-primary shadow-primary/10 shadow-lg"
                      : "border-white/5 bg-white/5 text-white/40 hover:bg-white/10",
                  )}
                >
                  <Trophy className="size-4" />
                  {t("ratingSystem.elo")}
                </button>
                <button
                  type="button"
                  onClick={() => setValue("ratingSystem", "points")}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-2xl border p-4 text-sm font-bold transition-all",
                    ratingSystem === "points"
                      ? "border-primary/50 bg-primary/10 text-primary shadow-primary/10 shadow-lg"
                      : "border-white/5 bg-white/5 text-white/40 hover:bg-white/10",
                  )}
                >
                  <Hash className="size-4" />
                  {t("ratingSystem.points")}
                </button>
              </div>
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
                  {ratingSystem === "elo" ? (
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
                  <div className="bg-primary/5 absolute -top-12 -right-12 h-32 w-32 rounded-full blur-3xl" />
                  <h4 className="text-primary mb-4 flex items-center gap-2 text-sm font-bold">
                    <Zap className="size-4" />
                    {t("explanation.title")}
                  </h4>
                  <div className="space-y-5 text-xs leading-relaxed text-white/60">
                    <p className="font-medium text-white/80 italic">
                      {ratingSystem === "elo"
                        ? t("explanation.elo.description")
                        : t("explanation.points.description")}
                    </p>
                    <div className="grid gap-3 pt-2">
                      {ratingSystem === "elo" ? (
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
                          <div className="mt-1 space-y-2 rounded-2xl bg-white/2 p-4">
                            <p className="text-[10px] font-bold tracking-wider text-white/30 uppercase">
                              {t("explanation.elo.thresholds")}
                            </p>
                            <div className="grid grid-cols-2 gap-4 gap-y-3 sm:grid-cols-3">
                              {[1, 3, 5, 10, 20].map((m) => {
                                const multiplier = 1 + (m - 1) * scoreRelevance;
                                return (
                                  <div
                                    key={m}
                                    className="flex flex-col gap-0.5"
                                  >
                                    <span className="text-[10px] text-white/40">
                                      {t("explanation.elo.win_margin", {
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
                          {inactivityDecay > 0 && (
                            <div className="flex items-center gap-3">
                              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white/5 text-red-500/50">
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
                            <ArrowUpRight className="size-4 text-emerald-500" />
                            <span className="text-white/80">
                              {t("explanation.points.win", {
                                amount: pointsPerWin || 0,
                              })}
                            </span>
                          </div>
                          {allowDraw && (
                            <div className="flex items-center gap-3">
                              <Equal className="size-4 text-amber-500" />
                              <span className="text-white/80">
                                {t("explanation.points.draw", {
                                  amount: pointsPerDraw || 0,
                                })}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-3">
                            <ArrowDownRight className="size-4 text-rose-500" />
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
