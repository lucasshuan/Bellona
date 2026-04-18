"use client";

import { useTransition, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";import { zodResolver } from "@hookform/resolvers/zod";
import { useEditGameSchema, type EditGameValues } from "@/schemas/game";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { updateGame } from "@/actions/game";
import { type Game } from "@/lib/apollo/generated/graphql";
import { cn } from "@/lib/utils";
import { resolveImageValue } from "@/lib/upload";
import { ImageUploadInput } from "@/components/ui/image-upload-input";

interface EditGameFormProps {
  game: Game;
  onSuccess: () => void;
  onLoadingChange?: (loading: boolean) => void;
  onValidationChange?: (isValid: boolean) => void;
  formId: string;
}

export function EditGameForm({
  game,
  onSuccess,
  onLoadingChange,
  onValidationChange,
  formId,
}: EditGameFormProps) {
  const t = useTranslations("Modals.EditGame");
  const schema = useEditGameSchema();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isValid },
  } = useForm<EditGameValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: game.name,
      slug: game.slug,
      description: game.description || "",
      backgroundImageUrl: game.backgroundImageUrl || "",
      thumbnailImageUrl: game.thumbnailImageUrl || "",
      steamUrl: game.steamUrl || "",
    },
    mode: "onChange",
  });

  // Notify parent about loading state
  useEffect(() => {
    onLoadingChange?.(isPending);
  }, [isPending, onLoadingChange]);

  // Notify parent about validation state
  useEffect(() => {
    onValidationChange?.(isValid);
  }, [isValid, onValidationChange]);

  const onSubmit = async (values: EditGameValues) => {
    startTransition(async () => {
      let backgroundImageUrl: string | null;
      let thumbnailImageUrl: string | null;
      try {
        [backgroundImageUrl, thumbnailImageUrl] = await Promise.all([
          resolveImageValue(values.backgroundImageUrl),
          resolveImageValue(values.thumbnailImageUrl),
        ]);
      } catch {
        toast.error(t("uploadError") || "Failed to upload image.");
        return;
      }

      const result = await updateGame(game.id, {
        ...values,
        slug: values.slug,
        backgroundImageUrl,
        thumbnailImageUrl,
        steamUrl: values.steamUrl || null,
        description: values.description ?? null,
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
    <form
      id={formId}
      onSubmit={handleSubmit(onSubmit)}
      className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2"
    >
      <div className="flex flex-col gap-2">
        <label
          htmlFor="name"
          className="ml-1 text-sm font-medium text-white/70"
        >
          {t("name.label")}
        </label>
        <input
          id="name"
          type="text"
          {...register("name")}
          placeholder={t("name.placeholder")}
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
        <label
          htmlFor="slug"
          className="ml-1 text-sm font-medium text-white/70"
        >
          {t("slug.label")}
        </label>
        <input
          id="slug"
          type="text"
          {...register("slug")}
          onChange={(e) => {
            const sanitized = e.target.value
              .toLowerCase()
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .replace(/[^a-z0-9_-]/g, "");
            setValue("slug", sanitized, { shouldValidate: true });
          }}
          placeholder={t("slug.placeholder")}
          className={cn(
            "field-base",
            errors.slug ? "field-border-error" : "field-border-default",
          )}
        />
        {errors.slug && (
          <p className="field-error-text">{errors.slug.message}</p>
        )}
      </div>

      <div className="col-span-full flex flex-col gap-2">
        <label
          htmlFor="description"
          className="ml-1 text-sm font-medium text-white/70"
        >
          {t("descriptionField.label")}
        </label>
        <textarea
          id="description"
          rows={3}
          {...register("description")}
          placeholder={t("descriptionField.placeholder")}
          className={cn(
            "field-textarea custom-scrollbar",
            errors.description ? "field-border-error" : "field-border-default",
          )}
        />
        {errors.description && (
          <p className="field-error-text">
            {errors.description.message}
          </p>
        )}
      </div>

      <div>
        <Controller
          name="backgroundImageUrl"
          control={control}
          render={({ field }) => (
            <ImageUploadInput
              value={field.value}
              onChange={field.onChange}
              label={t("backgroundImage.label")}
              error={errors.backgroundImageUrl?.message}
              disabled={isPending}
            />
          )}
        />
      </div>

      <Controller
        name="thumbnailImageUrl"
        control={control}
        render={({ field }) => (
          <ImageUploadInput
            value={field.value}
            onChange={field.onChange}
            label={t("thumbnailImage.label")}
            error={errors.thumbnailImageUrl?.message}
            disabled={isPending}
          />
        )}
      />

      <div className="col-span-full flex flex-col gap-2">
        <label
          htmlFor="steamUrl"
          className="ml-1 text-sm font-medium text-white/70"
        >
          {t("steamUrl.label")}
        </label>
        <input
          id="steamUrl"
          type="text"
          {...register("steamUrl")}
          className={cn(
            "field-base",
            errors.steamUrl ? "field-border-error" : "field-border-default",
          )}
        />
        {errors.steamUrl && (
          <p className="field-error-text">{errors.steamUrl.message}</p>
        )}
      </div>
    </form>
  );
}
