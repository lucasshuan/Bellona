"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAddPlayerSchema, type AddPlayerValues } from "@/schemas/player";
import {
  Search,
  Check,
  ChevronRight,
  User,
  LoaderCircle,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { addPlayerToGame, searchPlayersByGame } from "@/actions/game";
import { cn } from "@/lib/utils";

type SearchUser = {
  id: string;
  username: string;
  country: string | null;
};

interface AddPlayerFormProps {
  gameId: string;
  onSuccess: () => void;
  onLoadingChange?: (loading: boolean) => void;
  onValidationChange?: (isValid: boolean) => void;
  formId: string;
}

export function AddPlayerForm({
  gameId,
  onSuccess,
  onLoadingChange,
  onValidationChange,
  formId,
}: AddPlayerFormProps) {
  const t = useTranslations("Modals.AddPlayer");
  const schema = useAddPlayerSchema();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
  } = useForm<AddPlayerValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: "",
      userId: null,
    },
    mode: "onChange",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<SearchUser | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Notify parent about loading state
  useEffect(() => {
    onLoadingChange?.(isPending);
  }, [isPending, onLoadingChange]);

  // Notify parent about validation state
  useEffect(() => {
    onValidationChange?.(isValid);
  }, [isValid, onValidationChange]);

  useEffect(() => {
    if (searchQuery.length < 2) {
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const result = await searchPlayersByGame(gameId, searchQuery);
      if (result.success && result.data) {
        setSearchResults(result.data);
      } else {
        console.error("Search failed:", result.error);
        setSearchResults([]);
      }
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, gameId]);

  const onSubmit = async (values: AddPlayerValues) => {
    startTransition(async () => {
      const result = await addPlayerToGame(gameId, {
        username: values.username.trim(),
        userId: values.userId || null,
      });

      if (result.success) {
        toast.success(
          values.userId
            ? t("successExisting", { username: values.username })
            : t("successNew", { username: values.username }),
        );
        onSuccess();
      } else {
        toast.error(result.error || t("error"));
      }
    });
  };

  const handleSelectUser = (user: SearchUser) => {
    setSelectedUser(user);
    setValue("username", user.username, { shouldValidate: true });
    setValue("userId", user.id, { shouldValidate: true });
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleRemoveLink = () => {
    setSelectedUser(null);
    setValue("userId", null, { shouldValidate: true });
  };

  const handleSearchQueryChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = event.target.value;

    setSearchQuery(value);

    if (value.length < 2) {
      setIsSearching(false);
      setSearchResults([]);
    }
  };

  return (
    <form
      id={formId}
      onSubmit={handleSubmit(onSubmit)}
      className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2"
    >
      {/* Username Input */}
      <div className="flex flex-col gap-2">
        <label
          htmlFor="username"
          className="ml-1 text-sm font-medium text-white/70"
        >
          {t("username.label")}
        </label>
        <div className="relative">
          <input
            type="text"
            id="username"
            {...register("username")}
            placeholder={t("username.placeholder")}
            className={cn(
              "field-base",
              errors.username ? "field-border-error" : "field-border-default",
            )}
          />
          {selectedUser && (
            <button
              type="button"
              onClick={handleRemoveLink}
              className="absolute top-1/2 right-3 -translate-y-1/2 p-1 text-white/30 hover:text-white"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
        {errors.username && (
          <p className="field-error-text">{errors.username.message}</p>
        )}
      </div>

      {/* User Search (Optional Link) */}
      <div className="flex flex-col gap-2">
        <label className="ml-1 text-sm font-medium text-white/70">
          {t("link.label")}
        </label>
        <div className="relative">
          <div className="relative">
            <Search className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchQueryChange}
              placeholder={t("link.placeholder")}
              className="field-base border-white/10 py-3 pr-4 pl-11"
            />
          </div>

          {/* Results Dropdown */}
          {(searchResults.length > 0 || isSearching) && (
            <div className="glass-panel absolute top-full left-0 z-10 mt-2 flex max-h-60 w-full flex-col overflow-hidden rounded-2xl shadow-2xl">
              {isSearching ? (
                <div className="flex items-center justify-center p-8">
                  <LoaderCircle className="text-primary size-6 animate-spin" />
                </div>
              ) : (
                <div className="custom-scrollbar overflow-y-auto p-1">
                  {searchResults.map((user: SearchUser) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => handleSelectUser(user)}
                      className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors hover:bg-white/10"
                    >
                      <div className="flex size-8 items-center justify-center rounded-full bg-white/5">
                        <User className="size-4 text-white/40" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-white">
                          {user.username}
                        </span>
                        {user.country && (
                          <span className="text-[10px] text-white/30 capitalize">
                            {user.country}
                          </span>
                        )}
                      </div>
                      <ChevronRight className="ml-auto size-4 text-white/20" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Selected User Info */}
      {selectedUser && (
        <div className="col-span-full">
          <div className="border-primary/20 bg-primary/5 flex items-center gap-4 rounded-2xl border p-4">
            <div className="bg-primary/10 flex size-10 items-center justify-center rounded-full">
              <Check className="text-primary size-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white">
                {t("link.selected", { username: selectedUser.username })}
              </span>
              <span className="text-xs text-white/50">
                {t("link.selectedDesc")}
              </span>
            </div>
            <button
              type="button"
              onClick={handleRemoveLink}
              className="ml-auto rounded-xl bg-white/5 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-white/10"
            >
              {t("link.remove")}
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
