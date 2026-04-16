"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useAddPlayerToLeagueSchema,
  type AddPlayerToLeagueValues,
} from "@/schemas/player";
import { Search, Plus, LoaderCircle, AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  createAndAddPlayerToLeague,
  addPlayerToLeague,
  searchPlayersByGame,
} from "@/actions/game";
import { cn } from "@/lib/utils";

interface AddPlayerToLeagueFormProps {
  gameId: string;
  leagueId: string;
  onSuccess: () => void;
  onLoadingChange?: (loading: boolean) => void;
}

interface PlayerResult {
  id: string;
  username: string;
  country: string | null;
}

export function AddPlayerToLeagueForm({
  gameId,
  leagueId,
  onSuccess,
  onLoadingChange,
}: AddPlayerToLeagueFormProps) {
  const t = useTranslations("Modals.AddPlayerToLeague");
  const schema = useAddPlayerToLeagueSchema();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<AddPlayerToLeagueValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: "",
    },
    mode: "onChange",
  });

  const searchQuery = useWatch({
    control,
    name: "username",
    defaultValue: "",
  });
  const [searchResults, setSearchResults] = useState<PlayerResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const usernameField = register("username", {
    onChange: (event) => {
      const value = event.target.value as string;

      if (value.length < 2) {
        setIsSearching(false);
        setSearchResults([]);
        setHasSearched(false);
      }
    },
  });

  // Notify parent about loading state
  useEffect(() => {
    onLoadingChange?.(isPending);
  }, [isPending, onLoadingChange]);

  useEffect(() => {
    if (searchQuery.length < 2) {
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const result = await searchPlayersByGame(gameId, searchQuery);
      if (result.success && result.data) {
        setSearchResults(result.data);
        setHasSearched(true);
      } else {
        console.error("Error occurred while searching players:", result.error);
        setSearchResults([]);
      }
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, gameId]);

  const handleAddExisting = (playerId: string) => {
    startTransition(async () => {
      const result = await addPlayerToLeague(leagueId, playerId);
      if (result.success) {
        toast.success(t("success"));
        onSuccess();
      } else {
        toast.error(result.error || t("error"));
      }
    });
  };

  const handleCreateAndAdd = handleSubmit(async (values) => {
    startTransition(async () => {
      const result = await createAndAddPlayerToLeague(
        gameId,
        leagueId,
        values.username,
      );
      if (result.success) {
        toast.success(t("success"));
        onSuccess();
      } else {
        toast.error(result.error || t("error"));
      }
    });
  });

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute top-3.5 left-4 size-5 text-white/30" />
        <input
          {...usernameField}
          autoFocus
          type="text"
          placeholder={t("search.placeholder")}
          className={cn(
            "focus:border-primary/50 focus:ring-primary/10 w-full rounded-2xl border bg-white/5 pt-3.5 pr-12 pb-3.5 pl-12 text-sm text-white transition-all outline-none placeholder:text-white/20 focus:bg-white/[0.07] focus:ring-4",
            errors.username ? "border-red-500/50" : "border-white/10",
          )}
        />
        {isSearching && (
          <div className="absolute top-3.5 right-4">
            <LoaderCircle className="text-primary size-5 animate-spin" />
          </div>
        )}
      </div>

      {errors.username && (
        <p className="ml-1 text-xs text-red-400">{errors.username.message}</p>
      )}

      <div className="space-y-2">
        {searchResults.map(
          (player: {
            id: string;
            username: string;
            country: string | null;
          }) => (
            <button
              key={player.id}
              type="button"
              onClick={() => handleAddExisting(player.id)}
              disabled={isPending}
              className="hover:border-primary/30 flex w-full items-center justify-between rounded-xl border border-white/5 bg-white/5 px-4 py-3 transition-all hover:bg-white/10 disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                {player.country && (
                  <span
                    className={`fi fi-${player.country.toLowerCase()} fis rounded-xs`}
                  />
                )}
                <span className="font-medium text-white">
                  {player.username}
                </span>
              </div>
              <Plus className="text-primary size-4" />
            </button>
          ),
        )}

        {hasSearched &&
          searchResults.length === 0 &&
          searchQuery.length >= 2 && (
            <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-4">
              <div className="flex items-start gap-4">
                <AlertCircle className="mt-0.5 size-5 text-yellow-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-500">
                    {t("search.notFound")}
                  </p>
                  <p className="mt-1 text-xs text-yellow-500/60">
                    {t("createPlayer.warning")}
                  </p>
                  <button
                    type="button"
                    onClick={handleCreateAndAdd}
                    disabled={isPending || !!errors.username}
                    className="mt-3 text-xs font-bold tracking-wider text-white uppercase hover:underline disabled:opacity-50"
                  >
                    {t("createPlayer.action")}
                  </button>
                </div>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
