"use client";

import { useState, useTransition, useEffect } from "react";
import { Search, Check, ChevronRight, User, LoaderCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { addPlayerToGame, searchPlayersByGame } from "@/actions/game";
import { Modal } from "@/components/ui/modal";

type SearchUser = {
  id: string;
  username: string;
  country: string | null;
};

type AddPlayerModalProps = {
  gameId: string;
  isOpen: boolean;
  onClose: () => void;
};

export function AddPlayerModal({
  gameId,
  isOpen,
  onClose,
}: AddPlayerModalProps) {
  const t = useTranslations("Modals.AddPlayer");
  const [isPending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<SearchUser | null>(null);
  const [username, setUsername] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchPlayersByGame(gameId, searchQuery);
        setSearchResults(results);
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, gameId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) return;

    startTransition(async () => {
      try {
        const result = await addPlayerToGame(gameId, {
          username: username.trim(),
          userId: selectedUser?.id || null,
        });

        if (result.success) {
          toast.success(
            selectedUser
              ? t("successExisting", { username })
              : t("successNew", { username }),
          );
          onClose();
          // Reset form
          setUsername("");
          setSearchQuery("");
          setSelectedUser(null);
        }
      } catch (error) {
        toast.error(t("error"));
        console.error(error);
      }
    });
  };

  const handleSelectUser = (user: SearchUser) => {
    setSelectedUser(user);
    setUsername(user.username);
    setSearchQuery("");
    setSearchResults([]);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("title")}
      description={t("description")}
      cancelText={t("cancel")}
      confirmText={isPending ? t("submitting") : t("submit")}
      formId="add-player-form"
      isPending={isPending}
      disabled={!username}
    >
      <form
        id="add-player-form"
        onSubmit={handleSubmit}
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
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t("username.placeholder")}
              className="focus:border-primary/50 focus:ring-primary/10 w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white outline-hidden transition-all placeholder:text-white/20 focus:bg-white/[0.07] focus:ring-4"
              required
            />
            {selectedUser && (
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="absolute top-1/2 right-3 -translate-y-1/2 p-1 text-white/30 hover:text-white"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
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
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("link.placeholder")}
                className="focus:border-primary/50 focus:ring-primary/10 w-full rounded-2xl border border-white/10 bg-white/5 py-3 pr-4 pl-11 text-sm text-white outline-hidden transition-all placeholder:text-white/20 focus:bg-white/[0.07] focus:ring-4"
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
                    {searchResults.map((user) => (
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
                onClick={() => setSelectedUser(null)}
                className="ml-auto rounded-xl bg-white/5 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-white/10"
              >
                {t("link.remove")}
              </button>
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
}

const X = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);
