"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import { Search, Trophy, LoaderCircle, AlertTriangle } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { useTranslations } from "next-intl";
import { getGamesSimple, type SimpleGame } from "@/actions/get-games";
import { LabelTooltip } from "@/components/ui/label-tooltip";
import { cn } from "@/lib/utils";

/* ─────────────────────── Game Search Fieldset (add form) ─────────────────── */

interface GameSearchFieldsetProps {
  gameId?: string;
  initialGame?: SimpleGame;
  isGameFixed?: boolean;
}

type GameFormFields = {
  gameId?: string;
  gameName?: string;
};

export function GameSearchFieldset({
  gameId,
  initialGame,
  isGameFixed,
}: GameSearchFieldsetProps) {
  const t = useTranslations("Modals.AddLeague");
  const {
    setValue,
    formState: { errors },
  } = useFormContext<GameFormFields>();

  const [games, setGames] = useState<SimpleGame[]>([]);
  const [isGamesLoading, setIsGamesLoading] = useState(false);
  const [gameSearch, setGameSearch] = useState(initialGame?.name ?? "");
  const [selectedGame, setSelectedGame] = useState<SimpleGame | null>(
    initialGame ?? null,
  );
  const [showResults, setShowResults] = useState(false);
  const hasInitialized = useRef(!!initialGame);

  const hasExactMatch = useMemo(() => {
    if (!gameSearch) return false;
    return games.some(
      (g) => g.name.toLowerCase().trim() === gameSearch.toLowerCase().trim(),
    );
  }, [games, gameSearch]);

  useEffect(() => {
    if (
      initialGame &&
      gameSearch === initialGame.name &&
      !hasInitialized.current
    ) {
      hasInitialized.current = true;
      return;
    }

    const fetchGames = async () => {
      setIsGamesLoading(true);
      const result = await getGamesSimple(gameSearch);
      if (result.success && result.data) {
        setGames(result.data);

        if (gameId && result.data.length > 0 && !hasInitialized.current) {
          const g = result.data.find((x) => x.id === gameId);
          if (g) {
            setSelectedGame(g);
            setGameSearch(g.name);
            hasInitialized.current = true;
            setValue("gameId", g.id, { shouldValidate: true });
            setValue("gameName", undefined, { shouldValidate: true });
          }
        }
      }
      setIsGamesLoading(false);
    };

    fetchGames();
  }, [gameSearch, gameId, setValue, initialGame]);

  useEffect(() => {
    if (selectedGame) {
      setValue("gameId", selectedGame.id, { shouldValidate: true });
      setValue("gameName", undefined, { shouldValidate: true });
    } else if (gameSearch && !hasExactMatch && !isGamesLoading) {
      setValue("gameId", undefined, { shouldValidate: true });
      setValue("gameName", gameSearch, { shouldValidate: true });
    } else {
      setValue("gameId", undefined, { shouldValidate: true });
      setValue("gameName", undefined, { shouldValidate: true });
    }
  }, [selectedGame, gameSearch, hasExactMatch, isGamesLoading, setValue]);

  return (
    <section className="animate-in fade-in slide-in-from-right-4 space-y-8 duration-500">
      <div className="flex flex-col gap-6">
        <LabelTooltip label={t("gameSelect.label")} required />

        <div className="relative">
          <div className="relative">
            <Search className="text-secondary/25 absolute top-1/2 left-4 size-5 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t("gameSelect.placeholder")}
              value={gameSearch}
              onFocus={() => setShowResults(true)}
              onChange={(e) => {
                setGameSearch(e.target.value);
                setShowResults(true);
                if (selectedGame) setSelectedGame(null);
              }}
              disabled={isGameFixed}
              className={cn(
                "field-base py-3.5 pr-4 pl-12",
                "disabled:cursor-not-allowed disabled:opacity-50",
                errors.gameId || errors.gameName
                  ? "field-border-error"
                  : "field-border-default",
              )}
            />
            {isGamesLoading && (
              <LoaderCircle className="text-primary/40 absolute top-1/2 right-4 size-4 -translate-y-1/2 animate-spin" />
            )}
          </div>

          {gameSearch &&
            !selectedGame &&
            showResults &&
            (games.length > 0 || !isGamesLoading) && (
              <div className="glass-panel animate-in fade-in slide-in-from-top-2 border-gold-dim/35 absolute top-full left-0 z-50 mt-2 w-full overflow-hidden rounded-3xl border bg-black/60 shadow-2xl backdrop-blur-xl duration-200">
                <div className="custom-scrollbar max-h-60 overflow-y-auto p-2">
                  {!hasExactMatch && !isGamesLoading && (
                    <button
                      type="button"
                      onClick={() => setShowResults(false)}
                      className="group hover:bg-card-strong/45 flex w-full items-center gap-3 rounded-2xl p-3 text-left transition-all"
                    >
                      <div className="border-primary/20 bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-lg border">
                        <Search className="size-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-primary text-sm font-bold">
                          {t("gameSelect.searchNew", { name: gameSearch })}
                        </span>
                        <span className="text-secondary/35 text-[10px] tracking-widest uppercase">
                          {t("gameSelect.newGameWarning")}
                        </span>
                      </div>
                    </button>
                  )}

                  {games.map((game) => (
                    <button
                      key={game.id}
                      type="button"
                      onClick={() => {
                        setSelectedGame(game);
                        setGameSearch(game.name);
                        setShowResults(false);
                      }}
                      className="group hover:bg-card-strong/45 flex w-full items-center gap-3 rounded-2xl p-3 text-left transition-all"
                    >
                      <div className="border-gold-dim/25 relative size-10 shrink-0 overflow-hidden rounded-lg border bg-black/40">
                        {game.thumbnailImageUrl ? (
                          <Image
                            src={game.thumbnailImageUrl}
                            alt={game.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="bg-card-strong/45 flex size-full items-center justify-center">
                            <Trophy className="text-secondary/25 size-4" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="group-hover:text-primary text-sm font-bold text-white transition-colors">
                          {game.name}
                        </span>
                        <span className="text-secondary/35 text-[10px] tracking-widest uppercase">
                          {game.slug}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
        </div>

        <div className="border-gold-dim/35 bg-card-strong/25 relative flex h-45 flex-col items-center justify-center overflow-hidden rounded-3xl border p-6 transition-all">
          {selectedGame ? (
            <div className="animate-in fade-in zoom-in-95 flex w-full flex-col gap-4 duration-300">
              <div className="flex items-center gap-4">
                <div className="border-gold-dim/35 relative size-16 shrink-0 overflow-hidden rounded-2xl border bg-black/40 shadow-2xl">
                  {selectedGame.thumbnailImageUrl ? (
                    <Image
                      src={selectedGame.thumbnailImageUrl}
                      alt={selectedGame.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center">
                      <Trophy className="size-6 text-white/10" />
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="text-lg leading-tight font-bold text-white">
                    {selectedGame.name}
                  </h4>
                  <p className="text-primary text-[10px] font-bold tracking-[0.2em] uppercase">
                    {selectedGame.slug}
                  </p>
                </div>
              </div>
              <p className="text-secondary/55 line-clamp-3 text-sm leading-relaxed">
                {selectedGame.description || t("gamePage.noDescription")}
              </p>
            </div>
          ) : gameSearch &&
            !selectedGame &&
            !hasExactMatch &&
            !isGamesLoading ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 flex w-full flex-col items-center justify-center gap-4 text-center duration-500">
              <div className="bg-warning/10 text-warning flex size-12 items-center justify-center rounded-2xl">
                <AlertTriangle className="size-6" />
              </div>
              <div className="w-full space-y-2">
                <p className="text-sm font-bold tracking-wider text-white uppercase">
                  {t("gameSelect.newGameWarning")}
                </p>
                <p className="text-secondary/35 mx-auto max-w-110 text-xs leading-relaxed">
                  {t("gameSelect.newGameInstructions")}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 text-center opacity-20">
              <Trophy className="size-10 text-white" />
              <p className="text-xs font-bold tracking-[0.3em] uppercase">
                {t("gameSelect.placeholder")}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────── Game Display Fieldset (edit form) ───────────────── */

interface GameDisplayFieldsetProps {
  game?: {
    name: string;
    slug: string;
    thumbnailImageUrl?: string | null;
    description?: string | null;
  } | null;
}

export function GameDisplayFieldset({ game }: GameDisplayFieldsetProps) {
  const t = useTranslations("Modals.AddLeague");

  return (
    <section className="animate-in fade-in slide-in-from-right-4 space-y-6 duration-500">
      <div className="space-y-2">
        <h3 className="text-lg font-bold text-white">
          {t("gameSelect.label")}
        </h3>
        <p className="text-secondary/55 text-sm">{game?.name}</p>
      </div>

      <div className="border-gold-dim/35 bg-card-strong/25 relative flex h-45 flex-col items-center justify-center overflow-hidden rounded-3xl border p-6 transition-all">
        <div className="animate-in fade-in zoom-in-95 flex w-full flex-col gap-4 duration-300">
          <div className="flex items-center gap-4">
            <div className="border-gold-dim/35 relative size-16 shrink-0 overflow-hidden rounded-2xl border bg-black/40 shadow-2xl">
              {game?.thumbnailImageUrl ? (
                <Image
                  src={game.thumbnailImageUrl}
                  alt={game.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex size-full items-center justify-center">
                  <Trophy className="size-6 text-white/10" />
                </div>
              )}
            </div>
            <div>
              <h4 className="text-lg leading-tight font-bold text-white">
                {game?.name}
              </h4>
              <p className="text-primary text-[10px] font-bold tracking-[0.2em] uppercase">
                {game?.slug}
              </p>
            </div>
          </div>
          <p className="text-secondary/55 line-clamp-3 text-sm leading-relaxed">
            {game?.description ?? "No description."}
          </p>
        </div>
      </div>
    </section>
  );
}
