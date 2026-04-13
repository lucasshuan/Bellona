import { GameCardSkeleton } from "@/components/brand/game-card";
import { Gamepad2 } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function ProfileLoading() {
  const t = await getTranslations("ProfilePage");

  return (
    <main>
      <div className="mx-auto mt-10 flex w-full max-w-7xl flex-col-reverse gap-8 px-6 pb-12 sm:px-10 lg:flex-row lg:gap-12 lg:px-12">
        {/* Main Content Skeleton */}
        <div className="min-w-0 flex-1 space-y-6">
          <div className="space-y-2">
            <div className="border-b-[3px] border-white/10">
              <nav className="-mb-[3px] flex space-x-8" aria-label="Tabs">
                <span className="border-primary text-primary flex items-center gap-2.5 border-b-[3px] pb-2 pt-4 text-base font-medium whitespace-nowrap transition-all">
                  <Gamepad2 className="size-5" />
                  {t("playedGamesTab")}
                </span>
              </nav>
            </div>

            <section className="grid gap-6 pt-6 md:grid-cols-2">
              <GameCardSkeleton />
              <GameCardSkeleton />
              <GameCardSkeleton />
              <GameCardSkeleton />
            </section>
          </div>
        </div>

        {/* Sidebar Skeleton */}
        <aside className="w-full shrink-0 lg:w-[320px] xl:w-[360px]">
          <div className="glass-panel sticky top-28 overflow-hidden rounded-4xl">
            <div className="relative z-10 flex flex-col items-center p-8 text-center">
              {/* Avatar Skeleton */}
              <div className="size-32 animate-pulse rounded-full border-4 border-white/10 bg-white/5 shadow-xl" />

              {/* Name Skeleton */}
              <div className="mt-6 h-8 w-40 animate-pulse rounded-lg bg-white/10" />

              {/* Bio Skeleton */}
              <div className="mt-6 w-full max-w-[280px] space-y-2">
                <div className="h-3 w-full animate-pulse rounded bg-white/5" />
                <div className="h-3 w-5/6 animate-pulse rounded bg-white/5 mx-auto" />
                <div className="h-3 w-4/6 animate-pulse rounded bg-white/5 mx-auto" />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
