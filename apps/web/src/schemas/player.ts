import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { z } from "zod";

type TFunction = (
  key: string,
  values?: Record<string, string | number | Date>,
) => string;

export const getAddPlayerSchema = (t: TFunction) =>
  z.object({
    username: z
      .string()
      .min(3, t("min", { count: 3 }))
      .max(30, t("max", { count: 30 })),
    userId: z.string().nullable().optional(),
  });

export const getAddPlayerToRankingSchema = (t: TFunction) =>
  z.object({
    username: z
      .string()
      .min(3, t("min", { count: 3 }))
      .max(30, t("max", { count: 30 })),
  });

export const useAddPlayerSchema = () => {
  const t = useTranslations("Validations");
  return useMemo(() => getAddPlayerSchema(t), [t]);
};

export const useAddPlayerToRankingSchema = () => {
  const t = useTranslations("Validations");
  return useMemo(() => getAddPlayerToRankingSchema(t), [t]);
};

export type AddPlayerValues = z.infer<ReturnType<typeof getAddPlayerSchema>>;
export type AddPlayerToRankingValues = z.infer<
  ReturnType<typeof getAddPlayerToRankingSchema>
>;
