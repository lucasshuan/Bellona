"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { LoaderCircle, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { updateProfile } from "@/server/user-actions";
import { useRouter, usePathname } from "@/i18n/routing";

type UserData = {
  id: string;
  name: string;
  username: string;
  bio?: string | null;
};

type EditProfileModalProps = {
  isOpen: boolean;
  onClose: () => void;
  user: UserData;
};

export function EditProfileModal({
  isOpen,
  onClose,
  user,
}: EditProfileModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("EditProfilePage");
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [fieldErrors, setFieldErrors] = useState<{
    username?: string;
    name?: string;
  }>({});

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === modalRef.current) {
      onClose();
    }
  };

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setFieldErrors({});

    startTransition(async () => {
      try {
        const result = await updateProfile(formData);
        if (!result.success && result.errors) {
          setFieldErrors(result.errors);
          toast.error("Por favor, corrija os erros no formulário.");
          return;
        }

        toast.success(t("successMessage"));

        // If the user changed their username and we are on a profile page, redirect to the new slug
        if (result.success && result.slug) {
          const isProfilePage = pathname.includes("/profile/");
          if (isProfilePage) {
            router.push(`/profile/${result.slug}`);
          }
        }

        onClose();
      } catch {
        toast.error("Ocorreu um erro ao atualizar o perfil. Tente novamente.");
      }
    });
  }

  const modalContent = (
    <div
      ref={modalRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
    >
      <div className="glass-panel animate-in fade-in-0 zoom-in-95 w-full max-w-md overflow-hidden rounded-4xl p-8 duration-200">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              {t("editProfileTitle")}
            </h2>
            <p className="text-muted mt-1 text-sm">
              {t("editProfileDescription")}
            </p>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer rounded-full p-2 text-white/70 transition-colors hover:bg-white/10"
            aria-label={t("cancelButton")}
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="username"
              className="ml-1 text-sm font-medium text-white/70"
            >
              {t("usernameLabel")}
            </label>
            <input
              type="text"
              id="username"
              name="username"
              required
              defaultValue={user.username ?? ""}
              placeholder={t("usernamePlaceholder")}
              className={`focus:ring-primary/10 w-full rounded-2xl border bg-white/5 px-5 py-3 text-sm text-white outline-hidden transition-all placeholder:text-white/20 focus:bg-white/[0.07] focus:ring-4 ${
                fieldErrors.username
                  ? "border-red-500/50"
                  : "focus:border-primary/50 border-white/10"
              }`}
            />
            {fieldErrors.username ? (
              <p className="ml-1 text-xs text-red-400">
                {t(fieldErrors.username)}
              </p>
            ) : (
              <p className="ml-1 text-[10px] text-white/40">
                {t("usernameDescription")}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="name"
              className="ml-1 text-sm font-medium text-white/70"
            >
              {t("nameLabel")}
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              defaultValue={user.name ?? ""}
              placeholder={t("namePlaceholder")}
              className={`focus:ring-primary/10 w-full rounded-2xl border bg-white/5 px-5 py-3 text-sm text-white outline-hidden transition-all placeholder:text-white/20 focus:bg-white/[0.07] focus:ring-4 ${
                fieldErrors.name
                  ? "border-red-500/50"
                  : "focus:border-primary/50 border-white/10"
              }`}
            />
            {fieldErrors.name && (
              <p className="ml-1 text-xs text-red-400">{t(fieldErrors.name)}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="bio"
              className="ml-1 text-sm font-medium text-white/70"
            >
              {t("bioLabel")}
            </label>
            <textarea
              id="bio"
              name="bio"
              defaultValue={user.bio ?? ""}
              placeholder={t("bioPlaceholder")}
              rows={3}
              className="focus:border-primary/50 focus:ring-primary/10 w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white outline-hidden transition-all placeholder:text-white/20 focus:bg-white/[0.07] focus:ring-4"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-8 py-3 text-sm font-semibold text-black transition-all hover:bg-white/90 focus:ring-4 focus:ring-white/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending && <LoaderCircle className="size-4 animate-spin" />}
              {t("saveChanges")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Use createPortal to mount it to the document body to avoid z-index and css flow issues.
  if (typeof document === "undefined") return null;
  return createPortal(modalContent, document.body);
}

// Wrapper to simplify rendering trigger and modal without making parent a client component completely if we don't want to.
export function EditProfileTrigger({
  user,
  children,
}: {
  user: UserData;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div
        className="inline-flex w-full cursor-pointer"
        onClick={() => setIsOpen(true)}
      >
        {children}
      </div>
      <EditProfileModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        user={user}
      />
    </>
  );
}
