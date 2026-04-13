"use client";

import { useState, useTransition } from "react";
import { AlertTriangle, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { SignInButton } from "@/components/auth/sign-in-button";
import { ActionButton } from "@/components/ui/action-button";
import { Modal } from "@/components/ui/modal";
import { createGame } from "@/server/actions/game";

import { useUser } from "@/components/providers";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function AddGameModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { user, canManageGames } = useUser();
  const isLoggedIn = !!user;
  const t = useTranslations("GamesPage.addGame");
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [backgroundImageUrl, setBackgroundImageUrl] = useState("");
  const [thumbnailImageUrl, setThumbnailImageUrl] = useState("");
  const [steamUrl, setSteamUrl] = useState("");
  const [isSlugDirty, setIsSlugDirty] = useState(false);

  const resetForm = () => {
    setName("");
    setSlug("");
    setDescription("");
    setBackgroundImageUrl("");
    setThumbnailImageUrl("");
    setSteamUrl("");
    setIsSlugDirty(false);
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isLoggedIn || !name.trim() || !slug.trim()) {
      return;
    }

    startTransition(async () => {
      try {
        const result = await createGame({
          name,
          slug,
          description,
          backgroundImageUrl,
          thumbnailImageUrl,
          steamUrl,
        });

        toast.success(
          result.status === "approved" ? t("successApproved") : t("successPending"),
        );
        handleClose();
      } catch {
        toast.error(t("error"));
      }
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t("title")}
      description={isLoggedIn ? t("description") : t("descriptionLoggedOut")}
    >
      {!isLoggedIn ? (
        <div className="space-y-4">
          <p className="text-sm leading-6 text-white/65">{t("loginHint")}</p>
          <SignInButton
            label={t("loginAction")}
            className="w-full"
            size="md"
          />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {!canManageGames && (
            <div className="rounded-3xl border border-amber-400/25 bg-amber-500/12 p-4 text-amber-50 shadow-[0_0_0_1px_rgba(251,191,36,0.06)]">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-2xl bg-amber-400/20 p-2 text-amber-200">
                  <AlertTriangle className="size-4" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-amber-100">
                    {t("reviewAlertTitle")}
                  </p>
                  <p className="text-sm leading-6 text-amber-50/85">
                    {t("reviewAlertDescription")}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label
              htmlFor="game_name"
              className="ml-1 text-sm font-medium text-white/70"
            >
              {t("nameLabel")}
            </label>
            <input
              id="game_name"
              type="text"
              required
              value={name}
              onChange={(e) => {
                const nextName = e.target.value;
                setName(nextName);
                if (!isSlugDirty) {
                  setSlug(slugify(nextName));
                }
              }}
              placeholder={t("namePlaceholder")}
              className="focus:border-primary/50 focus:ring-primary/10 w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white outline-hidden transition-all placeholder:text-white/20 focus:bg-white/[0.07] focus:ring-4"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="game_slug"
              className="ml-1 text-sm font-medium text-white/70"
            >
              {t("slugLabel")}
            </label>
            <input
              id="game_slug"
              type="text"
              required
              value={slug}
              onChange={(e) => {
                setIsSlugDirty(true);
                setSlug(slugify(e.target.value));
              }}
              placeholder={t("slugPlaceholder")}
              className="focus:border-primary/50 focus:ring-primary/10 w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white outline-hidden transition-all placeholder:text-white/20 focus:bg-white/[0.07] focus:ring-4"
            />
            <p className="ml-1 text-[11px] text-white/40 italic">
              {t("slugDescription")}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="game_description"
              className="ml-1 text-sm font-medium text-white/70"
            >
              {t("descriptionLabel")}
            </label>
            <textarea
              id="game_description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("descriptionPlaceholder")}
              className="focus:border-primary/50 focus:ring-primary/10 w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white outline-hidden transition-all placeholder:text-white/20 focus:bg-white/[0.07] focus:ring-4"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="game_background_image"
              className="ml-1 text-sm font-medium text-white/70"
            >
              {t("backgroundImageLabel")}
            </label>
            <input
              id="game_background_image"
              type="text"
              value={backgroundImageUrl}
              onChange={(e) => setBackgroundImageUrl(e.target.value)}
              className="focus:border-primary/50 focus:ring-primary/10 w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white outline-hidden transition-all focus:bg-white/[0.07] focus:ring-4"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="game_thumbnail_image"
              className="ml-1 text-sm font-medium text-white/70"
            >
              {t("thumbnailImageLabel")}
            </label>
            <input
              id="game_thumbnail_image"
              type="text"
              value={thumbnailImageUrl}
              onChange={(e) => setThumbnailImageUrl(e.target.value)}
              className="focus:border-primary/50 focus:ring-primary/10 w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white outline-hidden transition-all focus:bg-white/[0.07] focus:ring-4"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="game_steam_url"
              className="ml-1 text-sm font-medium text-white/70"
            >
              {t("steamUrlLabel")}
            </label>
            <input
              id="game_steam_url"
              type="text"
              value={steamUrl}
              onChange={(e) => setSteamUrl(e.target.value)}
              className="focus:border-primary/50 focus:ring-primary/10 w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white outline-hidden transition-all focus:bg-white/[0.07] focus:ring-4"
            />
          </div>

          <ActionButton
            type="submit"
            intent="primary"
            icon={Plus}
            label={isPending ? t("submitting") : t("submit")}
            disabled={isPending || !name.trim() || !slug.trim()}
          />
        </form>
      )}
    </Modal>
  );
}
