"use client";

import { useState, useRef, useEffect } from "react";
import { useFormContext, useWatch, Controller } from "react-hook-form";
import { LoaderCircle, Check, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { LabelTooltip } from "@/components/ui/label-tooltip";
import { TiptapEditor } from "@/components/ui/tiptap-editor";
import { cn, slugify } from "@/lib/utils";

type GeneralFormValues = {
  name: string;
  slug: string;
  description?: string;
  about?: string;
};

interface GeneralFieldsetProps {
  onSlugStatusChange: (isChecking: boolean, hasConflict: boolean) => void;
  checkSlugAvailability: (
    slug: string,
  ) => Promise<{ success: boolean; data?: { available: boolean } }>;
  originalSlug?: string;
}

export function GeneralFieldset({
  onSlugStatusChange,
  checkSlugAvailability,
  originalSlug,
}: GeneralFieldsetProps) {
  const t = useTranslations("Modals.AddLeague");
  const {
    register,
    control,
    setValue,
    formState: { errors, touchedFields },
  } = useFormContext<GeneralFormValues>();

  const name = useWatch({ control, name: "name" }) ?? "";
  const slug = useWatch({ control, name: "slug" }) ?? "";

  const [isSlugModified, setIsSlugModified] = useState(false);
  const [slugAvailability, setSlugAvailability] = useState<{
    value: string;
    status: "idle" | "available" | "conflict";
  }>({
    value: originalSlug ?? "",
    status: originalSlug ? "available" : "idle",
  });
  const slugRequestRef = useRef(0);

  const canCheckSlug = !!slug && slugify(slug).length > 0;
  const isSlugChecking =
    canCheckSlug && slug !== originalSlug && slugAvailability.value !== slug;
  const hasSlugConflict =
    canCheckSlug &&
    slug !== originalSlug &&
    slugAvailability.value === slug &&
    slugAvailability.status === "conflict";

  // Auto-generate slug from name
  useEffect(() => {
    if (!isSlugModified && name) {
      setValue("slug", slugify(name), { shouldValidate: true });
    }
  }, [name, isSlugModified, setValue]);

  // Debounced slug availability check
  useEffect(() => {
    if (!canCheckSlug || slug === originalSlug) {
      slugRequestRef.current += 1;
      return;
    }

    const requestId = ++slugRequestRef.current;
    const timeoutId = window.setTimeout(async () => {
      const result = await checkSlugAvailability(slug);
      if (slugRequestRef.current !== requestId) return;

      if (!result.success) {
        setSlugAvailability({ value: slug, status: "available" });
        return;
      }

      setSlugAvailability({
        value: slug,
        status: result.data?.available ? "available" : "conflict",
      });
    }, 400);

    return () => window.clearTimeout(timeoutId);
  }, [canCheckSlug, slug, originalSlug, checkSlugAvailability]);

  // Notify parent of slug status
  useEffect(() => {
    onSlugStatusChange(isSlugChecking, hasSlugConflict);
  }, [isSlugChecking, hasSlugConflict, onSlugStatusChange]);

  return (
    <section className="animate-in fade-in slide-in-from-right-4 space-y-8 duration-500">
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
        <p className="text-secondary/35 text-xs">{t("aboutField.hint")}</p>
      </div>

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
                setValue("slug", sanitized, { shouldValidate: true });
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
              <LoaderCircle className="text-secondary/25 absolute top-1/2 right-4 size-4 -translate-y-1/2 animate-spin" />
            ) : canCheckSlug && slug !== originalSlug && !errors.slug ? (
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
  );
}
