import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { z } from "zod";

type TFunction = (
  key: string,
  values?: Record<string, string | number | Date>,
) => string;

export const getEditGameSchema = (t: TFunction) => {
  const urlSchema = z
    .url(t("invalidUrl"))
    .or(z.literal(""))
    .nullable()
    .optional();

  const imageFieldSchema = z
    .union([z.instanceof(File), z.string()])
    .nullable()
    .optional();

  return z.object({
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
    backgroundImageUrl: imageFieldSchema,
    thumbnailImageUrl: imageFieldSchema,
    steamUrl: urlSchema,
  });
};

export const useEditGameSchema = () => {
  const t = useTranslations("Validations");
  return useMemo(() => getEditGameSchema(t), [t]);
};

export type EditGameValues = z.infer<ReturnType<typeof getEditGameSchema>>;
