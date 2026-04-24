"use client";

import { useTransition, useState, useEffect, useCallback } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useAddLeagueSchema,
  type AddLeagueValues,
  LEAGUE_DEFAULT_SETTINGS,
} from "@/schemas/league";
import { createLeague, checkLeagueSlugAvailability } from "@/actions/game";
import { type SimpleGame } from "@/actions/get-games";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { GameSearchFieldset } from "./fieldsets/game-fieldset";
import { TypeFieldset } from "./fieldsets/type-fieldset";
import { LeagueConfigFieldset } from "./fieldsets/league-config-fieldset";
import { GeneralFieldset } from "./fieldsets/general-fieldset";
import { MatchFormatsFieldset } from "./fieldsets/match-formats-fieldset";

interface AddEventFormProps {
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

export function AddEventForm({
  gameId,
  onSuccess,
  onLoadingChange,
  onValidationChange,
  onStepValidationChange,
  formId,
  currentStep,
  initialGame,
  isGameFixed,
}: AddEventFormProps) {
  const t = useTranslations("Modals.AddEvent");
  const schema = useAddLeagueSchema();
  const [isPending, startTransition] = useTransition();
  const [participationMode, setParticipationMode] = useState<"SOLO" | "TEAM">(
    "SOLO",
  );
  const [eventType, setEventType] = useState<"LEAGUE" | "TOURNAMENT">("LEAGUE");
  const [isSlugChecking, setIsSlugChecking] = useState(false);
  const [hasSlugConflict, setHasSlugConflict] = useState(false);

  const methods = useForm<AddLeagueValues>({
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

  const {
    handleSubmit,
    formState: { isValid },
    getValues,
    watch,
  } = methods;

  const watchGameId = watch("gameId");
  const watchGameName = watch("gameName");
  const watchName = watch("name") ?? "";
  const watchSlug = watch("slug") ?? "";
  const allowedFormats = watch("allowedFormats") ?? [];

  const handleSlugStatusChange = useCallback(
    (checking: boolean, conflict: boolean) => {
      setIsSlugChecking(checking);
      setHasSlugConflict(conflict);
    },
    [],
  );

  const checkSlugAvailability = useCallback(
    (slug: string) => checkLeagueSlugAvailability(watchGameId ?? "", slug),
    [watchGameId],
  );

  useEffect(() => {
    onLoadingChange?.(isPending);
  }, [isPending, onLoadingChange]);

  const isFormValid = isValid && !isSlugChecking && !hasSlugConflict;

  useEffect(() => {
    onValidationChange?.(isFormValid);
  }, [isFormValid, onValidationChange]);

  useEffect(() => {
    let valid = false;

    if (currentStep === 0) {
      valid = !!watchGameId || !!watchGameName;
    } else if (currentStep === 1) {
      valid = true;
    } else if (currentStep === 2) {
      valid = allowedFormats.length > 0;
    } else if (currentStep === 3) {
      const values = getValues();
      const parseResult = schema.safeParse(values);
      if (parseResult.success) {
        valid = true;
      } else {
        const step3Fields = ["name", "slug"];
        const hasErrors = parseResult.error.issues.some((issue) =>
          step3Fields.includes(issue.path[0] as string),
        );
        valid = !hasErrors;
      }
      if (valid) valid = !isSlugChecking && !hasSlugConflict;
    }

    onStepValidationChange?.(valid);
  }, [
    currentStep,
    watchGameId,
    watchGameName,
    watchName,
    watchSlug,
    isSlugChecking,
    hasSlugConflict,
    allowedFormats.length,
    getValues,
    schema,
    onStepValidationChange,
  ]);

  const onSubmit = async (values: AddLeagueValues) => {
    if (isSlugChecking || hasSlugConflict) return;

    startTransition(async () => {
      const isElo = values.ratingSystem === "ELO";

      const config = isElo
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
        config,
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
    <FormProvider {...methods}>
      <form
        id={formId}
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-10"
      >
        {currentStep === 0 && (
          <GameSearchFieldset
            gameId={gameId}
            initialGame={initialGame}
            isGameFixed={isGameFixed}
          />
        )}
        {currentStep === 1 && (
          <TypeFieldset
            participationMode={participationMode}
            onParticipationModeChange={setParticipationMode}
            eventType={eventType}
            onEventTypeChange={setEventType}
          />
        )}
        {currentStep === 2 && (
          <div className="space-y-10">
            <LeagueConfigFieldset />
            <MatchFormatsFieldset />
          </div>
        )}
        {currentStep === 3 && (
          <GeneralFieldset
            onSlugStatusChange={handleSlugStatusChange}
            checkSlugAvailability={checkSlugAvailability}
          />
        )}
      </form>
    </FormProvider>
  );
}
