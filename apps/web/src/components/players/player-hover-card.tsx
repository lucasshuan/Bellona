"use client";

import * as React from "react";
import { Portal } from "@/components/ui/portal";
import { cn } from "@/lib/utils";
import { LoaderCircle, Calendar, Hash } from "lucide-react";
import Image from "next/image";
import { useQuery } from "@apollo/client/react";
import { GET_PLAYER } from "@/lib/apollo/queries/players";
import { type Player, type PlayerUsername } from "@/lib/apollo/types";
import { formatDate } from "@/lib/date-utils";

interface PlayerHoverCardProps {
  playerId: string;
  displayName: string;
  country: string | null;
  children: React.ReactNode;
}

export function PlayerHoverCard({
  playerId,
  displayName,
  country,
  children,
}: PlayerHoverCardProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [coords, setCoords] = React.useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });
  const [side, setSide] = React.useState<"top" | "bottom">("bottom");
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const triggerRef = React.useRef<HTMLDivElement>(null);

  const { data: apolloData, loading } = useQuery<{ player: Player }>(
    GET_PLAYER,
    {
      variables: { id: playerId },
      skip: !isOpen,
    },
  );
  const data = apolloData?.player;

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const estimatedHeight = 320;
      const spaceBelow = viewportHeight - rect.bottom;

      const newSide =
        spaceBelow < estimatedHeight && rect.top > estimatedHeight
          ? "top"
          : "bottom";
      setSide(newSide);

      setCoords({
        top: newSide === "bottom" ? rect.bottom + 8 : rect.top - 8,
        left: rect.left,
      });
    }

    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  return (
    <div
      ref={triggerRef}
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}

      {isOpen && (
        <Portal>
          <div
            className={cn(
              "animate-in fade-in fixed z-9999 w-72 duration-200",
              side === "top" ? "zoom-in-95 -translate-y-full" : "zoom-in-95",
            )}
            style={{
              top: coords.top,
              left: coords.left,
            }}
            onMouseEnter={handleMouseEnter} // Keep open when hovering the card
            onMouseLeave={handleMouseLeave}
          >
            <div className="glass-panel overflow-hidden rounded-3xl bg-[#0a080f] shadow-2xl ring-1 ring-white/10">
              <div className="flex flex-col">
                {/* Header - Always show immediately using props or fetched data */}
                <div className="relative h-20 overflow-hidden bg-white/5">
                  <div className="bg-primary/20 absolute inset-0 blur-xl" />
                </div>

                <div className="relative px-5 pb-5">
                  <div className="-mt-8 mb-4 flex items-end justify-between">
                    <div className="relative size-16 overflow-hidden rounded-2xl bg-[#0a080f] ring-4 ring-[#0a080f]">
                      {data?.user?.image ? (
                        <Image
                          src={data.user.image}
                          alt={data.user.name || data.user.username}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center bg-white/5 text-xl font-bold text-white/20">
                          {(data?.user?.name ?? displayName)
                            .slice(0, 1)
                            .toUpperCase()}
                        </div>
                      )}
                    </div>
                    {(data?.user?.country ?? country) && (
                      <div className="flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1 text-[10px] font-bold tracking-tight text-white/60">
                        <span
                          className={`fi fi-${(data?.user?.country ?? country)?.toLowerCase()} size-3 rounded-xs`}
                        />
                        {data?.user?.country ?? country}
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-lg font-bold text-white">
                        {data?.user?.name ?? displayName}
                      </h4>
                      {data ? (
                        data.user?.username && (
                          <p className="text-muted text-xs">
                            Account: @{data.user.username}
                          </p>
                        )
                      ) : (
                        <p className="h-4 w-24 animate-pulse rounded bg-white/5" />
                      )}
                    </div>

                    {loading && !data ? (
                      <div className="flex items-center justify-center py-4">
                        <LoaderCircle className="text-primary size-5 animate-spin" />
                      </div>
                    ) : data ? (
                      <>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-white/30 uppercase">
                            <Hash className="size-3" />
                            Nicknames
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {data.usernames?.map((u: PlayerUsername) => (
                              <span
                                key={u.id}
                                className="rounded-lg bg-white/5 px-2 py-0.5 text-xs text-white/50"
                              >
                                {u.username}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 pt-2">
                          <div className="flex items-center gap-2 text-white/40">
                            <Calendar className="size-3.5" />
                            <span className="text-[11px] font-medium">
                              Joined{" "}
                              {formatDate(data.user?.createdAt || "", "en")}
                            </span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-muted text-center text-[10px] italic">
                        Failed to load details
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}
