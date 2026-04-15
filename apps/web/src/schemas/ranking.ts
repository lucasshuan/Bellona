import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { z } from "zod";

type TFunction = (
  key: string,
  values?: Record<string, string | number | Date>,
) => string;

export const getAddRankingSchema = (t: TFunction) => {
  return z
    .object({
      name: z
        .string()
        .min(3, t("nameMin", { count: 3 }))
        .max(50, t("nameMax", { count: 50 })),
      slug: z
        .string()
        .min(3, t("min", { count: 3 }))
        .max(50, t("max", { count: 50 }))
        .regex(/^[a-z0-9-]+$/, t("slugFormat")),
      description: z
        .string()
        .max(500, t("descMax", { count: 500 }))
        .optional(),
      startDate: z.string().min(1, t("required")),
      endDate: z.string().optional(),
      allowDraw: z.boolean(),
      gameId: z.string().min(1, t("required")),
      ratingSystem: z.enum(["elo", "points"]),
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
    })
    .superRefine((data, ctx) => {
      if (data.ratingSystem === "elo") {
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

export const getEditRankingSchema = (t: TFunction) => {
  return z
    .object({
      name: z
        .string()
        .min(3, t("nameMin", { count: 3 }))
        .max(50, t("nameMax", { count: 50 })),
      slug: z
        .string()
        .min(3, t("min", { count: 3 }))
        .max(50, t("max", { count: 50 }))
        .regex(/^[a-z0-9-]+$/, t("slugFormat")),
      description: z
        .string()
        .max(500, t("descMax", { count: 500 }))
        .optional(),
      allowDraw: z.boolean(),
      ratingSystem: z.enum(["elo", "points"]),
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
    })
    .superRefine((data, ctx) => {
      if (data.ratingSystem === "elo") {
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
export const useAddRankingSchema = () => {
  const t = useTranslations("Validations");
  return useMemo(() => getAddRankingSchema(t), [t]);
};

export const useEditRankingSchema = () => {
  const t = useTranslations("Validations");
  return useMemo(() => getEditRankingSchema(t), [t]);
};

// Tipagem "Achatada" para o react-hook-form não reclamar das uniões
export type AddRankingValues = z.infer<ReturnType<typeof getAddRankingSchema>>;
export type EditRankingValues = z.infer<
  ReturnType<typeof getEditRankingSchema>
>;

export const RANKING_DEFAULT_SETTINGS = {
  initialElo: 1200,
  kFactor: 32,
  scoreRelevance: 0.5,
  inactivityDecay: 0,
  inactivityThresholdHours: 24,
  inactivityDecayFloor: 0,
  pointsPerWin: 3,
  pointsPerDraw: 1,
  pointsPerLoss: 0,
} as const;
