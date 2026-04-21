import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { z } from "zod";
import { MATCH_FORMATS } from "@ares/core";

type TFunction = (
  key: string,
  values?: Record<string, string | number | Date>,
) => string;

export const getAddLeagueSchema = (t: TFunction) => {
  return z
    .object({
      name: z
        .string()
        .min(2, t("nameMin", { count: 2 }))
        .max(50, t("nameMax", { count: 50 })),
      slug: z
        .string()
        .min(2, t("min", { count: 2 }))
        .max(50, t("max", { count: 50 }))
        .regex(/^[a-z0-9_-]+$/, t("slugFormat")),
      description: z
        .string()
        .max(500, t("descMax", { count: 500 }))
        .optional(),
      about: z.string().optional(),
      allowDraw: z.boolean(),
      gameId: z.string().optional(),
      gameName: z.string().optional(),
      ratingSystem: z.enum(["ELO", "POINTS"]),
      // Elo fields (optional in base object, required by superRefine)
      initialElo: z.number().min(0).optional(),
      kFactor: z.number().min(1).max(100).optional(),
      scoreRelevance: z.number().min(0).max(1).optional(),
      inactivityDecay: z.number().min(0).optional(),
      inactivityThresholdHours: z.number().min(1).optional(),
      inactivityDecayFloor: z.number().min(0).optional(),
      // Points fields
      pointsPerWin: z.number().min(0).optional(),
      pointsPerDraw: z.number().min(0).optional(),
      pointsPerLoss: z.number().min(0).optional(),
      allowedFormats: z
        .array(z.string())
        .refine(
          (formats) =>
            formats.every((format) =>
              MATCH_FORMATS.includes(format as (typeof MATCH_FORMATS)[number]),
            ),
          t("required"),
        )
        .min(1, t("required")),
    })
    .superRefine((data, ctx) => {
      if (!data.gameId && !data.gameName) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("required"),
          path: ["gameId"],
        });
      }

      if (data.ratingSystem === "ELO") {
        if (data.initialElo === undefined) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t("required"),
            path: ["initialElo"],
          });
        }
        if (data.kFactor === undefined) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t("required"),
            path: ["kFactor"],
          });
        }
        if (data.scoreRelevance === undefined) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t("required"),
            path: ["scoreRelevance"],
          });
        }
        if (data.inactivityDecay === undefined) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t("required"),
            path: ["inactivityDecay"],
          });
        }
        if (
          data.inactivityDecay !== undefined &&
          data.inactivityDecay > 0 &&
          data.inactivityThresholdHours === undefined
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t("required"),
            path: ["inactivityThresholdHours"],
          });
        }
        if (
          data.inactivityDecay !== undefined &&
          data.inactivityDecay > 0 &&
          data.inactivityDecayFloor === undefined
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t("required"),
            path: ["inactivityDecayFloor"],
          });
        }
      } else {
        if (data.pointsPerWin === undefined) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t("required"),
            path: ["pointsPerWin"],
          });
        }
        if (data.allowDraw && data.pointsPerDraw === undefined) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t("required"),
            path: ["pointsPerDraw"],
          });
        }
        if (data.pointsPerLoss === undefined) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t("required"),
            path: ["pointsPerLoss"],
          });
        }
      }
    });
};

export const getEditLeagueSchema = (t: TFunction) => {
  return z
    .object({
      name: z
        .string()
        .min(2, t("nameMin", { count: 2 }))
        .max(50, t("nameMax", { count: 50 })),
      slug: z
        .string()
        .min(2, t("min", { count: 2 }))
        .max(50, t("max", { count: 50 }))
        .regex(/^[a-z0-9_-]+$/, t("slugFormat")),
      description: z
        .string()
        .max(500, t("descMax", { count: 500 }))
        .optional(),
      about: z.string().optional(),
      allowDraw: z.boolean(),
      ratingSystem: z.enum(["ELO", "POINTS"]),
      // Elo fields
      initialElo: z.number().min(0).optional(),
      kFactor: z.number().min(1).max(100).optional(),
      scoreRelevance: z.number().min(0).max(1).optional(),
      inactivityDecay: z.number().min(0).optional(),
      inactivityThresholdHours: z.number().min(1).optional(),
      inactivityDecayFloor: z.number().min(0).optional(),
      // Points fields
      pointsPerWin: z.number().min(0).optional(),
      pointsPerDraw: z.number().min(0).optional(),
      pointsPerLoss: z.number().min(0).optional(),
      allowedFormats: z
        .array(z.string())
        .refine(
          (formats) =>
            formats.every((format) =>
              MATCH_FORMATS.includes(format as (typeof MATCH_FORMATS)[number]),
            ),
          t("required"),
        )
        .min(1, t("required")),
    })
    .superRefine((data, ctx) => {
      if (data.ratingSystem === "ELO") {
        if (data.initialElo === undefined) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t("required"),
            path: ["initialElo"],
          });
        }
        if (data.kFactor === undefined) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t("required"),
            path: ["kFactor"],
          });
        }
        if (data.scoreRelevance === undefined) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t("required"),
            path: ["scoreRelevance"],
          });
        }
        if (data.inactivityDecay === undefined) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t("required"),
            path: ["inactivityDecay"],
          });
        }
        if (
          data.inactivityDecay !== undefined &&
          data.inactivityDecay > 0 &&
          data.inactivityThresholdHours === undefined
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t("required"),
            path: ["inactivityThresholdHours"],
          });
        }
        if (
          data.inactivityDecay !== undefined &&
          data.inactivityDecay > 0 &&
          data.inactivityDecayFloor === undefined
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t("required"),
            path: ["inactivityDecayFloor"],
          });
        }
      } else {
        if (data.pointsPerWin === undefined) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t("required"),
            path: ["pointsPerWin"],
          });
        }
        if (data.allowDraw && data.pointsPerDraw === undefined) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t("required"),
            path: ["pointsPerDraw"],
          });
        }
        if (data.pointsPerLoss === undefined) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t("required"),
            path: ["pointsPerLoss"],
          });
        }
      }
    });
};

// Hooks para o Cliente
export const useAddLeagueSchema = () => {
  const t = useTranslations("Validations");
  return useMemo(() => getAddLeagueSchema(t), [t]);
};

export const useEditLeagueSchema = () => {
  const t = useTranslations("Validations");
  return useMemo(() => getEditLeagueSchema(t), [t]);
};

// Tipagem "Achatada" para o react-hook-form não reclamar das uniões
export type AddLeagueValues = z.infer<ReturnType<typeof getAddLeagueSchema>>;
export type EditLeagueValues = z.infer<ReturnType<typeof getEditLeagueSchema>>;

export const LEAGUE_DEFAULT_SETTINGS = {
  initialElo: 1000,
  kFactor: 20,
  scoreRelevance: 0,
  inactivityDecay: 0,
  inactivityThresholdHours: 120,
  inactivityDecayFloor: 1000,
  pointsPerWin: 3,
  pointsPerDraw: 1,
  pointsPerLoss: 0,
  allowedFormats: ["ONE_V_ONE"] as const,
} as const;
