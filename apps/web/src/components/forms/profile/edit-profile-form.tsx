"use client";

import { useTransition, useState, useEffect, useRef } from "react";

import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useEditProfileSchema,
  type EditProfileValues,
} from "@/schemas/profile";
import { Globe, ChevronDown, Search, X, Check } from "lucide-react";
import { createPortal } from "react-dom";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import { updateProfile } from "@/actions/user";
import { useRouter, usePathname } from "@/i18n/routing";
import { useSession } from "next-auth/react";
import { COUNTRIES } from "@/lib/countries";
import { cn } from "@/lib/utils";
import { LabelTooltip } from "@/components/ui/label-tooltip";

export type UserData = {
  id: string;
  name?: string | null;
  username: string;
  bio?: string | null;
  profileColor?: string | null;
  country?: string | null;
};

const PROFILE_COLORS = [
  "#c00b3b", // Original Red
  "#3b82f6", // Blue
  "#8b5cf6", // Violet
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#db2777", // Pink
  "#06b6d4", // Cyan
  "#84cc16", // Lime
  "#d946ef", // Fuschia
  "#64748b", // Slate
];

interface EditProfileFormProps {
  user: UserData;
  onSuccess: () => void;
  onLoadingChange?: (loading: boolean) => void;
  onValidationChange?: (isValid: boolean) => void;
  formId: string;
}

export function EditProfileForm({
  user,
  onSuccess,
  onLoadingChange,
  onValidationChange,
  formId,
}: EditProfileFormProps) {
  const t = useTranslations("Modals.EditProfile");
  const schema = useEditProfileSchema();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { update } = useSession();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid },
  } = useForm<EditProfileValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user.name || "",
      username: user.username || "",
      bio: user.bio || "",
      country: user.country || null,
      profileColor: user.profileColor || PROFILE_COLORS[0],
    },
    mode: "onChange",
  });

  const country = useWatch({ control, name: "country" });

  // Country Selection Logic
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [countryCoords, setCountryCoords] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const [countrySearch, setCountrySearch] = useState("");

  const dropdownRef = useRef<HTMLDivElement>(null);
  const countryTriggerRef = useRef<HTMLButtonElement>(null);

  // Localized and sorted countries
  const localizedCountries = COUNTRIES.map((c) => {
    try {
      const displayNames = new Intl.DisplayNames([locale], { type: "region" });
      return {
        code: c.code,
        name: displayNames.of(c.code) || c.name,
      };
    } catch {
      return c;
    }
  }).sort((a, b) => a.name.localeCompare(b.name, locale));

  const filteredCountries = localizedCountries.filter(
    (c) =>
      c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
      c.code.toLowerCase().includes(countrySearch.toLowerCase()),
  );

  const selectedCountryData = localizedCountries.find(
    (c) => c.code === country,
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !(
          event.target instanceof Element &&
          event.target.closest(".country-portal-content")
        )
      ) {
        setIsCountryDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleCountryDropdown = () => {
    if (!isCountryDropdownOpen && countryTriggerRef.current) {
      const rect = countryTriggerRef.current.getBoundingClientRect();
      setCountryCoords({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
    setIsCountryDropdownOpen(!isCountryDropdownOpen);
  };

  // Notify parent about loading state
  useEffect(() => {
    onLoadingChange?.(isPending);
  }, [isPending, onLoadingChange]);

  // Notify parent about validation state
  useEffect(() => {
    onValidationChange?.(isValid);
  }, [isValid, onValidationChange]);

  const onSubmit = async (values: EditProfileValues) => {
    startTransition(async () => {
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });

      const result = await updateProfile(formData);
      if (!result.success) {
        toast.error(result.error || "Ocorreu um erro ao atualizar o perfil.");
        return;
      }

      toast.success(t("success"));

      // Refresh session
      await update({
        username: values.username,
        name: values.name,
      });

      if (result.success && result.data) {
        const isProfilePage = pathname.includes("/profile/");
        if (isProfilePage) {
          router.push(`/profile/${result.data}`);
        }
      }

      onSuccess();
    });
  };

  return (
    <form
      id={formId}
      onSubmit={handleSubmit(onSubmit)}
      className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2"
    >
      <div className="flex flex-col gap-2">
        <LabelTooltip label={t("name.label")} htmlFor="name" required />
        <input
          type="text"
          id="name"
          {...register("name")}
          placeholder={t("name.placeholder")}
          className={cn(
            "focus:ring-primary/10 w-full rounded-2xl border bg-white/5 px-5 py-3 text-sm text-white transition-all outline-none placeholder:text-white/20 focus:bg-white/[0.07] focus:ring-4",
            errors.name
              ? "border-red-500/50"
              : "focus:border-primary/50 border-white/10",
          )}
        />
        {errors.name && (
          <p className="ml-1 text-xs text-red-400">{errors.name.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <LabelTooltip
          label={t("username.label")}
          tooltip={t("username.description")}
          htmlFor="username"
          required
        />
        <input
          type="text"
          id="username"
          {...register("username")}
          placeholder={t("username.placeholder")}
          className={cn(
            "focus:ring-primary/10 w-full rounded-2xl border bg-white/5 px-5 py-3 text-sm text-white transition-all outline-none placeholder:text-white/20 focus:bg-white/[0.07] focus:ring-4",
            errors.username
              ? "border-red-500/50"
              : "focus:border-primary/50 border-white/10",
          )}
        />
        {errors.username && (
          <p className="ml-1 text-xs text-red-400">{errors.username.message}</p>
        )}
      </div>

      {/* Country Selector */}
      <div className="flex flex-col gap-2">
        <LabelTooltip label={t("country.label")} />
        <div className="relative" ref={dropdownRef}>
          <button
            ref={countryTriggerRef}
            type="button"
            onClick={toggleCountryDropdown}
            className="focus:border-primary/50 focus:ring-primary/10 flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white transition-all outline-none hover:bg-white/[0.07] focus:ring-4"
          >
            <div className="flex items-center gap-3">
              {country ? (
                <>
                  <div className="flex size-5 items-center justify-center overflow-hidden rounded-sm">
                    <span
                      className={cn(
                        "fi",
                        `fi-${country.toLowerCase()} fis`,
                        "h-full w-full object-cover",
                      )}
                    />
                  </div>
                  <span className="font-medium text-white">
                    {selectedCountryData?.name}
                  </span>
                </>
              ) : (
                <>
                  <Globe className="size-5 text-white/30" />
                  <span className="text-white/30">
                    {t("country.placeholder")}
                  </span>
                </>
              )}
            </div>
            <ChevronDown
              className={cn(
                "size-4 text-white/30 transition-transform",
                isCountryDropdownOpen && "rotate-180",
              )}
            />
          </button>
          <input type="hidden" name="country" value={country || ""} />

          {isCountryDropdownOpen &&
            typeof document !== "undefined" &&
            createPortal(
              <div
                className="glass-panel country-portal-content custom-scrollbar fixed z-9999 mt-2 flex max-h-[250px] flex-col overflow-hidden rounded-2xl shadow-2xl"
                style={{
                  top: countryCoords.top,
                  left: countryCoords.left,
                  width: countryCoords.width,
                }}
              >
                <div className="relative border-b border-white/10 p-2">
                  <Search className="absolute top-5 left-5 size-4 text-white/30" />
                  <input
                    autoFocus
                    type="text"
                    value={countrySearch}
                    onChange={(e) => setCountrySearch(e.target.value)}
                    placeholder="Search country..."
                    className="w-full rounded-xl border-none bg-white/5 py-3 pr-4 pl-10 text-sm text-white outline-none focus:bg-white/10"
                  />
                  {countrySearch && (
                    <button
                      type="button"
                      onClick={() => setCountrySearch("")}
                      className="absolute top-5 right-5 text-white/30 hover:text-white"
                    >
                      <X className="size-4" />
                    </button>
                  )}
                </div>

                <div className="custom-scrollbar overflow-y-auto px-1 py-1">
                  <Controller
                    name="country"
                    control={control}
                    render={({ field }) => (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            field.onChange(null);
                            setIsCountryDropdownOpen(false);
                            setCountrySearch("");
                          }}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors hover:bg-white/10",
                            field.value === null && "bg-white/5",
                          )}
                        >
                          <Globe className="size-5 text-white/30" />
                          <span className="text-sm text-white">
                            {t("country.placeholder")}
                          </span>
                        </button>

                        {filteredCountries.map((c) => (
                          <button
                            key={c.code}
                            type="button"
                            onClick={() => {
                              field.onChange(c.code);
                              setIsCountryDropdownOpen(false);
                              setCountrySearch("");
                            }}
                            className={cn(
                              "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors hover:bg-white/10",
                              field.value === c.code && "bg-white/5",
                            )}
                          >
                            <div className="flex size-5 shrink-0 items-center justify-center overflow-hidden rounded-sm">
                              <span
                                className={cn(
                                  "fi",
                                  `fi-${c.code.toLowerCase()} fis`,
                                  "h-full w-full object-cover",
                                )}
                              />
                            </div>
                            <span className="truncate text-sm text-white">
                              {c.name}
                            </span>
                            {field.value === c.code && (
                              <Check className="text-primary ml-auto size-4" />
                            )}
                          </button>
                        ))}
                      </>
                    )}
                  />
                </div>
              </div>,
              document.body,
            )}
        </div>
      </div>

      <div className="col-span-full flex flex-col gap-2">
        <LabelTooltip label={t("bio.label")} htmlFor="bio" />
        <textarea
          id="bio"
          {...register("bio")}
          placeholder={t("bio.placeholder")}
          rows={3}
          className={cn(
            "focus:border-primary/50 focus:ring-primary/10 w-full resize-none rounded-2xl border bg-white/5 px-5 py-3 text-sm text-white transition-all outline-none placeholder:text-white/20 focus:bg-white/[0.07] focus:ring-4",
            errors.bio ? "border-red-500/50" : "border-white/10",
          )}
        />
        {errors.bio && (
          <p className="ml-1 text-xs text-red-400">{errors.bio.message}</p>
        )}
      </div>
      <div className="col-span-full flex flex-col gap-3">
        <LabelTooltip
          label={t("color.label")}
          tooltip={t("color.description")}
        />
        <div className="flex flex-wrap gap-3 p-1">
          <Controller
            name="profileColor"
            control={control}
            render={({ field }) => (
              <>
                {PROFILE_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => field.onChange(color)}
                    className={cn(
                      "relative flex size-8 shrink-0 items-center justify-center rounded-full transition-transform hover:scale-110 active:scale-95",
                      field.value === color &&
                        "ring-primary ring-2 ring-offset-2 ring-offset-[#0b080f]",
                    )}
                    style={{ backgroundColor: color }}
                  >
                    {field.value === color && (
                      <div className="size-2 rounded-full bg-white shadow-sm" />
                    )}
                  </button>
                ))}
              </>
            )}
          />
        </div>
      </div>
    </form>
  );
}
