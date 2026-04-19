import { Link } from "@/i18n/routing";
import { Suspense } from "react";
import { Compass, LayoutDashboard } from "lucide-react";
import Image from "next/image";
import { buttonVariants } from "@/components/ui/button";

import { SignInButton } from "@/components/triggers/auth/sign-in-button";
import { cn } from "@/lib/utils";
import {
  GameShowcase,
  type ShowcaseGame,
} from "@/components/layout/game-showcase";
import { getTranslations } from "next-intl/server";
import { GET_GAMES } from "@/lib/apollo/queries/games";
import { GetGamesQuery } from "@/lib/apollo/generated/graphql";
import { safeServerQuery } from "@/lib/apollo/safe-server-query";
import { getServerAuthSession } from "@/auth";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const t = await getTranslations("HomePage");
  const session = await getServerAuthSession();
  const user = session?.user;

  return (
    <main className="relative overflow-hidden">
      <div className="mx-auto flex w-full max-w-7xl flex-col px-6 sm:px-10 lg:px-12">
        {/* ── Hero ── */}
        <section className="relative flex min-h-[calc(100svh)] flex-col items-center justify-center pb-24 text-center">
          {/* Ambient glow */}
          <div
            className="pointer-events-none absolute inset-0 overflow-hidden"
            aria-hidden="true"
          >
            <div className="animate-hero-glow bg-primary/8 absolute -top-24 left-1/2 h-120 w-170 -translate-x-1/2 rounded-full blur-[140px]" />
            <div className="animate-hero-glow bg-primary-strong/10 absolute -bottom-32 -left-10 h-80 w-120 rounded-full blur-[120px] [animation-delay:-3s]" />
          </div>

          <div className="relative flex flex-col items-center gap-6">
            {user ? (
              <>
                {/* Title */}
                <h1 className="animate-hero-fade-up flex flex-wrap items-baseline justify-center gap-x-5 text-5xl tracking-tight sm:text-6xl lg:text-7xl">
                  <span className="text-primary font-bold drop-shadow-[0_0_40px_rgba(192,11,59,0.3)]">
                    Ares
                    <span className="text-primary/25 font-extralight">:</span>
                  </span>
                  <span className="text-foreground/80 font-extralight">
                    {t("heroTagline")}
                  </span>
                </h1>

                {/* Decorative divider */}
                <div className="animate-hero-line via-primary/50 h-px w-20 bg-linear-to-r from-transparent to-transparent sm:w-32" />

                {/* Subtitle */}
                <p className="animate-hero-fade-up text-muted max-w-xl text-base leading-relaxed [animation-delay:150ms] sm:text-lg">
                  {t("heroSubtitle")}
                </p>

                {/* CTAs */}
                <div className="animate-hero-fade-up flex gap-3 pt-2 [animation-delay:300ms] sm:gap-4">
                  <Link
                    href="/games"
                    className={cn(
                      buttonVariants({ intent: "secondary", size: "lg" }),
                      "px-8 text-sm sm:text-base",
                    )}
                  >
                    <Compass className="mr-2 size-5" />
                    {t("explore")}
                  </Link>
                  <Link
                    href="/dashboard"
                    className={cn(
                      buttonVariants({ intent: "primary", size: "lg" }),
                      "px-8 text-sm sm:text-base",
                    )}
                  >
                    <LayoutDashboard className="mr-2 size-5" />
                    {t("dashboard")}
                  </Link>
                </div>
                
                {/* Avatar + Welcome card */}
                <div className="animate-hero-fade-up mt-16 [animation-delay:150ms]">
                  <div className="animate-hero-float rounded-4xl border border-white/5 bg-primary-strong/10 px-5 py-3 shadow-lg shadow-black/20 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      <div className="bg-primary/15 absolute -inset-2 rounded-full blur-lg" />
                      <div className="relative overflow-hidden rounded-full border-2 border-white/10 shadow-lg shadow-black/30">
                        {user.image ? (
                          <Image
                            src={user.image}
                            alt={user.name ?? "Avatar"}
                            width={40}
                            height={40}
                            className="size-10 object-cover"
                          />
                        ) : (
                          <div className="flex size-10 items-center justify-center bg-white/5 text-base font-bold text-white/40">
                            {(user.name ?? user.username)?.[0]?.toUpperCase()}
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-muted text-base sm:text-lg">
                      {t("welcomeBack", { name: user.name ?? user.username })}
                    </p>
                  </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Title */}
                <h1 className="animate-hero-fade-up flex flex-wrap items-baseline justify-center gap-x-5 text-5xl tracking-tight sm:text-6xl lg:text-7xl">
                  <span className="text-primary font-bold drop-shadow-[0_0_40px_rgba(192,11,59,0.3)]">
                    Ares
                    <span className="text-primary/25 font-extralight">:</span>
                  </span>
                  <span className="text-foreground/80 font-extralight">
                    {t("heroTagline")}
                  </span>
                </h1>

                {/* Decorative divider */}
                <div className="animate-hero-line via-primary/50 h-px w-20 bg-linear-to-r from-transparent to-transparent sm:w-32" />

                {/* Subtitle */}
                <p className="animate-hero-fade-up text-muted max-w-xl text-base leading-relaxed [animation-delay:150ms] sm:text-lg">
                  {t("heroSubtitle")}
                </p>

                {/* CTAs */}
                <div className="animate-hero-fade-up flex gap-3 pt-2 [animation-delay:300ms] sm:gap-4">
                  <Link
                    href="/games"
                    className={cn(
                      buttonVariants({ intent: "secondary", size: "lg" }),
                      "px-8 text-sm sm:text-base",
                    )}
                  >
                    <Compass className="mr-2 size-5" />
                    {t("explore")}
                  </Link>
                  <SignInButton
                    size="lg"
                    label={t("join")}
                    className="text-sm sm:text-base"
                  />
                </div>
              </>
            )}
          </div>
        </section>

        {/* ── Communities ── */}
        <div className="relative">
          {/* Ember / fire particles rising from the box */}
          <div
            className="pointer-events-none absolute -top-80 right-0 left-0 z-10 h-96 overflow-hidden"
            aria-hidden="true"
          >
            {/* Glow base at the top of the box */}
            <div className="bg-primary/12 absolute bottom-0 left-1/2 h-40 w-3/4 -translate-x-1/2 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-1/2 h-24 w-1/2 -translate-x-1/2 rounded-full bg-orange-500/10 blur-[80px]" />

            {/* Particle field */}
            <div className="ember-field absolute inset-0">
              <span
                className="ember"
                style={{
                  left: "10%",
                  animationDelay: "0s",
                  animationDuration: "3.2s",
                }}
              />
              <span
                className="ember"
                style={{
                  left: "20%",
                  animationDelay: "0.8s",
                  animationDuration: "2.8s",
                }}
              />
              <span
                className="ember"
                style={{
                  left: "30%",
                  animationDelay: "1.6s",
                  animationDuration: "3.6s",
                }}
              />
              <span
                className="ember"
                style={{
                  left: "42%",
                  animationDelay: "0.3s",
                  animationDuration: "2.5s",
                }}
              />
              <span
                className="ember"
                style={{
                  left: "50%",
                  animationDelay: "1.1s",
                  animationDuration: "3.0s",
                }}
              />
              <span
                className="ember"
                style={{
                  left: "58%",
                  animationDelay: "2.0s",
                  animationDuration: "3.4s",
                }}
              />
              <span
                className="ember"
                style={{
                  left: "68%",
                  animationDelay: "0.5s",
                  animationDuration: "2.6s",
                }}
              />
              <span
                className="ember"
                style={{
                  left: "78%",
                  animationDelay: "1.4s",
                  animationDuration: "3.1s",
                }}
              />
              <span
                className="ember"
                style={{
                  left: "88%",
                  animationDelay: "0.9s",
                  animationDuration: "2.9s",
                }}
              />
              <span
                className="ember ember--bright"
                style={{
                  left: "25%",
                  animationDelay: "0.6s",
                  animationDuration: "3.5s",
                }}
              />
              <span
                className="ember ember--bright"
                style={{
                  left: "55%",
                  animationDelay: "1.8s",
                  animationDuration: "2.7s",
                }}
              />
              <span
                className="ember ember--bright"
                style={{
                  left: "75%",
                  animationDelay: "0.2s",
                  animationDuration: "3.3s",
                }}
              />
              <span
                className="ember ember--large"
                style={{
                  left: "35%",
                  animationDelay: "1.2s",
                  animationDuration: "4.0s",
                }}
              />
              <span
                className="ember ember--large"
                style={{
                  left: "65%",
                  animationDelay: "2.2s",
                  animationDuration: "3.8s",
                }}
              />
            </div>
          </div>

          {/* Styled box */}
          <div className="communities-box relative z-20 rounded-t-[2.5rem] border border-b-0 border-white/6 bg-linear-to-b from-[rgb(18_12_22/0.95)] to-[rgb(11_8_15/0.98)] px-6 pt-10 pb-2 shadow-[0_-20px_80px_rgb(192_11_59/0.06),inset_0_1px_0_rgb(255_255_255/0.05)] sm:px-10 sm:pt-14 lg:px-12 lg:pt-16">
            {/* Top edge glow line */}
            <div className="via-primary/30 absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent to-transparent" />

            <Suspense
              fallback={
                <div className="space-y-10">
                  <div className="space-y-1">
                    <div className="h-8 w-48 animate-pulse rounded-lg bg-white/8" />
                    <div className="h-5 w-72 animate-pulse rounded-lg bg-white/5" />
                  </div>
                  <div className="glass-panel aspect-video w-full animate-pulse rounded-3xl" />
                </div>
              }
            >
              <PublicGamesList
                labels={{
                  title: t("games.title"),
                  description: t("games.description"),
                  leagues: t("games.leagues"),
                  players: t("games.players"),
                  explore: t("games.exploreGame"),
                  viewAll: t("games.viewAll"),
                  emptyTitle: t("games.noGamesTitle"),
                  emptyDescription: t("games.noGamesDescription"),
                }}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </main>
  );
}

interface PublicGamesListProps {
  labels: {
    title: string;
    description: string;
    leagues: string;
    players: string;
    explore: string;
    viewAll: string;
    emptyTitle: string;
    emptyDescription: string;
  };
}

async function PublicGamesList({ labels }: PublicGamesListProps) {
  const data = await safeServerQuery<GetGamesQuery>({
    query: GET_GAMES,
    variables: { pagination: { skip: 0, take: 6 } },
  });

  const games = data?.games?.nodes || [];
  const gameList: ShowcaseGame[] = games.map((game) => ({
    id: game.id,
    name: game.name,
    slug: game.slug,
    description: game.description,
    thumbnailImageUrl: game.thumbnailImageUrl,
    backgroundImageUrl: game.backgroundImageUrl,
    leagueCount: game._count?.leagues || 0,
    playerCount: game._count?.players || 0,
  }));

  return <GameShowcase games={gameList} labels={labels} />;
}
