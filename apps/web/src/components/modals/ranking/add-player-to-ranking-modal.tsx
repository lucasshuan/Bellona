"use client";

import { useState, useTransition, useEffect } from "react";
import { Search, AlertCircle, LoaderCircle, Plus } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import {
  searchPlayersByGame,
  addPlayerToRanking,
  createAndAddPlayerToRanking,
} from "@/actions/game";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface AddPlayerToRankingModalProps {
  gameId: string;
  rankingId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface PlayerResult {
  id: string;
  username: string;
  country: string | null;
}

export function AddPlayerToRankingModal({
  gameId,
  rankingId,
  isOpen,
  onClose,
}: AddPlayerToRankingModalProps) {
  const t = useTranslations("Modals.AddPlayerToRanking");
  const [isPending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<PlayerResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

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
        onClose();
        setSearchQuery("");
      } catch {
        toast.error(t("error"));
      }
    });
  };

  const handleCreateAndAdd = () => {
    startTransition(async () => {
      try {
        await createAndAddPlayerToRanking(gameId, rankingId, searchQuery);
        toast.success(t("success"));
        onClose();
        setSearchQuery("");
      } catch {
        toast.error(t("error"));
      }
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("title")}
      description={t("description")}
      cancelText={t("cancel") || "Cancelar"}
    >
      <div className="space-y-6">
        <div className="relative">
          <Search className="absolute top-3.5 left-4 size-5 text-white/30" />
          <input
            autoFocus
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("search.placeholder")}
            className="focus:border-primary/50 focus:ring-primary/10 w-full rounded-2xl border border-white/10 bg-white/5 pt-3.5 pr-4 pb-3.5 pl-12 text-sm text-white outline-hidden transition-all placeholder:text-white/20 focus:bg-white/[0.07] focus:ring-4"
          />
          {isSearching && (
            <div className="absolute top-3.5 right-4">
              <LoaderCircle className="text-primary size-5 animate-spin" />
            </div>
          )}
        </div>

        <div className="space-y-2">
          {searchResults.map((player) => (
            <button
              key={player.id}
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
          ))}

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
                      onClick={handleCreateAndAdd}
                      disabled={isPending}
                      className="mt-3 text-xs font-bold tracking-wider text-white uppercase hover:underline"
                    >
                      {t("createPlayer.action")}
                    </button>
                  </div>
                </div>
              </div>
            )}
        </div>
      </div>
    </Modal>
  );
}
