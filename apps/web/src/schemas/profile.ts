import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { z } from "zod";

type TFunction = (
  key: string,
  values?: Record<string, string | number | Date>,
) => string;

export const getEditProfileSchema = (t: TFunction) =>
  z.object({
    name: z
      .string()
      .min(3, t("nameMin", { count: 3 }))
      .max(50, t("nameMax", { count: 50 })),
    username: z
      .string()
      .min(3, t("min", { count: 3 }))
      .max(30, t("max", { count: 30 }))
      .regex(/^[a-z0-9_.]+$/, t("usernameFormat")),
    bio: z
      .string()
      .max(160, t("descMax", { count: 160 }))
      .optional(),
    country: z.string().nullable().optional(),
    profileColor: z.string().min(1, t("required")),
  });

export const useEditProfileSchema = () => {
  const t = useTranslations("Validations");
  return useMemo(() => getEditProfileSchema(t), [t]);
};

export type EditProfileValues = z.infer<
  ReturnType<typeof getEditProfileSchema>
>;
