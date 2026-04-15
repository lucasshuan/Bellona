"use client";

import { useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEditGameSchema, type EditGameValues } from "@/schemas/game";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { updateGame } from "@/actions/game";
import { type Game } from "@/lib/apollo/types";
import { cn } from "@/lib/utils";

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
    formState: { errors, isValid },
  } = useForm<EditGameValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: game.name,
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
      try {
        await updateGame(game.id, {
          ...values,
          backgroundImageUrl: values.backgroundImageUrl || null,
          thumbnailImageUrl: values.thumbnailImageUrl || null,
          steamUrl: values.steamUrl || null,
          description: values.description ?? null,
        });
        toast.success(t("success"));
        onSuccess();
      } catch {
        toast.error(t("error"));
      }
    });
  };

  return (
    <form
      id={formId}
      onSubmit={handleSubmit(onSubmit)}
      className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2"
    >
      <div className="col-span-full flex flex-col gap-2">
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
            "focus:border-primary/50 focus:ring-primary/10 w-full rounded-2xl border bg-white/5 px-5 py-3 text-sm text-white transition-all outline-none placeholder:text-white/20 focus:bg-white/[0.07] focus:ring-4",
            errors.name ? "border-red-500/50" : "border-white/10",
          )}
        />
        {errors.name && (
          <p className="ml-1 text-xs text-red-400">{errors.name.message}</p>
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
            "focus:border-primary/50 focus:ring-primary/10 w-full resize-none rounded-2xl border bg-white/5 px-5 py-3 text-sm text-white transition-all outline-none placeholder:text-white/20 focus:bg-white/[0.07] focus:ring-4",
            errors.description ? "border-red-500/50" : "border-white/10",
          )}
        />
        {errors.description && (
          <p className="ml-1 text-xs text-red-400">
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="col-span-full flex flex-col gap-2">
        <label
          htmlFor="backgroundImageUrl"
          className="ml-1 text-sm font-medium text-white/70"
        >
          {t("backgroundImage.label")}
        </label>
        <input
          id="backgroundImageUrl"
          type="text"
          {...register("backgroundImageUrl")}
          className={cn(
            "focus:border-primary/50 focus:ring-primary/10 w-full rounded-2xl border bg-white/5 px-5 py-3 text-sm text-white transition-all outline-none placeholder:text-white/20 focus:bg-white/[0.07] focus:ring-4",
            errors.backgroundImageUrl ? "border-red-500/50" : "border-white/10",
          )}
        />
        {errors.backgroundImageUrl && (
          <p className="ml-1 text-xs text-red-400">
            {errors.backgroundImageUrl.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="thumbnailImageUrl"
          className="ml-1 text-sm font-medium text-white/70"
        >
          {t("thumbnailImage.label")}
        </label>
        <input
          id="thumbnailImageUrl"
          type="text"
          {...register("thumbnailImageUrl")}
          className={cn(
            "focus:border-primary/50 focus:ring-primary/10 w-full rounded-2xl border bg-white/5 px-5 py-3 text-sm text-white transition-all outline-none placeholder:text-white/20 focus:bg-white/[0.07] focus:ring-4",
            errors.thumbnailImageUrl ? "border-red-500/50" : "border-white/10",
          )}
        />
        {errors.thumbnailImageUrl && (
          <p className="ml-1 text-xs text-red-400">
            {errors.thumbnailImageUrl.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
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
            "focus:border-primary/50 focus:ring-primary/10 w-full rounded-2xl border bg-white/5 px-5 py-3 text-sm text-white transition-all outline-none placeholder:text-white/20 focus:bg-white/[0.07] focus:ring-4",
            errors.steamUrl ? "border-red-500/50" : "border-white/10",
          )}
        />
        {errors.steamUrl && (
          <p className="ml-1 text-xs text-red-400">{errors.steamUrl.message}</p>
        )}
      </div>
    </form>
  );
}
