"use client";

import { useTransition, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useAddPlayerToRankingSchema,
  type AddPlayerToRankingValues,
} from "@/schemas/player";
import { Search, Plus, LoaderCircle, AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  createAndAddPlayerToRanking,
  addPlayerToRanking,
  searchPlayersByGame,
} from "@/actions/game";
import { cn } from "@/lib/utils";

interface AddPlayerToRankingFormProps {
  gameId: string;
  rankingId: string;
  onSuccess: () => void;
  onLoadingChange?: (loading: boolean) => void;
}

interface PlayerResult {
  id: string;
  username: string;
  country: string | null;
}

export function AddPlayerToRankingForm({
  gameId,
  rankingId,
  onSuccess,
  onLoadingChange,
}: AddPlayerToRankingFormProps) {
  const t = useTranslations("Modals.AddPlayerToRanking");
  const schema = useAddPlayerToRankingSchema();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<AddPlayerToRankingValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: "",
    },
    mode: "onChange",
  });

  const searchQuery = watch("username");
  const [searchResults, setSearchResults] = useState<PlayerResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Notify parent about loading state
  useEffect(() => {
    onLoadingChange?.(isPending);
  }, [isPending, onLoadingChange]);

  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchPlayersByGame(gameId, searchQuery);
        setSearchResults(results);
        setHasSearched(true);
      } catch {
        console.error("Error occurred while searching players");
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, gameId]);

  const handleAddExisting = (playerId: string) => {
    startTransition(async () => {
      try {
        await addPlayerToRanking(rankingId, playerId);
        toast.success(t("success"));
        onSuccess();
      } catch {
        toast.error(t("error"));
      }
    });
  };

  const handleCreateAndAdd = handleSubmit(async (values) => {
    startTransition(async () => {
      try {
        await createAndAddPlayerToRanking(gameId, rankingId, values.username);
        toast.success(t("success"));
        onSuccess();
      } catch {
        toast.error(t("error"));
      }
    });
  });

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute top-3.5 left-4 size-5 text-white/30" />
        <input
          {...register("username")}
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
