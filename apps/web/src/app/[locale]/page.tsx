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
    <main className="relative -mt-12 overflow-hidden lg:mt-0">
      {/* ── Hero background — Bellona ── */}
      <div
        className="pointer-events-none absolute top-0 hidden h-svh sm:-left-120 sm:block md:-left-90 lg:-left-60 xl:-left-30"
        aria-hidden="true"
      >
        <div className="relative h-full overflow-hidden mask-[linear-gradient(to_left,transparent_0%,transparent_8%,black_70%,black_100%),linear-gradient(to_top,transparent_0%,black_33%,black_100%)] mask-intersect">
          <Image
            src="/hero-bg.png"
            alt=""
            width={1718}
            height={916}
            className="h-full w-auto max-w-none brightness-90"
            priority
          />
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-7xl flex-col px-6 sm:px-10 lg:px-12">
        {/* ── Hero ── */}
        <section className="relative flex min-h-[calc(100svh)] flex-col items-center justify-center pb-24 text-center">
          {/* Ambient glow */}
          <div
            className="pointer-events-none absolute inset-0 overflow-hidden"
            aria-hidden="true"
          >
            <div className="animate-hero-glow bg-primary/8 absolute -top-24 left-1/2 h-120 w-170 -translate-x-1/2 rounded-full blur-[140px]" />
            <div className="animate-hero-glow bg-primary-strong/10 absolute -right-10 -bottom-32 h-80 w-120 rounded-full blur-[120px] [animation-delay:-3s]" />
          </div>

          <div className="relative flex flex-col items-center gap-6 md:max-w-[52%] md:self-end">
            {/* ── Imperial wordmark ── */}
            <div className="animate-hero-fade-up flex flex-col items-center">
              {/* Top ornament */}
              <div
                className="flex items-center gap-3 pb-2 opacity-80"
                aria-hidden="true"
              >
                <span className="via-primary/60 h-px w-10 bg-linear-to-r from-transparent to-transparent sm:w-16" />
                <span className="text-primary/70 text-xs">✦</span>
                <span className="via-primary/60 h-px w-10 bg-linear-to-r from-transparent to-transparent sm:w-16" />
              </div>

              {/* Wordmark */}
              <div className="relative">
                <span
                  aria-hidden="true"
                  className="font-display pointer-events-none absolute inset-0 top-0.5 left-0.5 text-6xl font-normal tracking-[0.06em] text-black uppercase filter-[blur(0.5px)] select-none sm:text-7xl sm:tracking-[0.08em] lg:text-8xl"
                >
                  Bellona
                </span>
                <h1 className="font-display relative bg-[linear-gradient(180deg,var(--gold)_0%,var(--gold)_70%,var(--primary)_100%)] bg-clip-text text-6xl font-normal tracking-[0.06em] text-transparent uppercase sm:text-7xl sm:tracking-[0.08em] lg:text-8xl">
                  Bellona
                </h1>
              </div>

              {/* Divider */}
              <div className="animate-hero-line via-primary/60 mt-3 h-px w-24 bg-linear-to-r from-transparent to-transparent sm:w-40" />

              {/* Sub-label */}
              <div className="relative mt-3">
                <p className="relative z-20 animate-[tagline-shimmer_4s_ease-in-out_infinite] bg-[linear-gradient(90deg,var(--primary),color-mix(in_srgb,var(--primary)_50%,var(--secondary)),var(--primary))] bg-size-[200%_auto] bg-clip-text font-sans text-[11px] font-semibold tracking-[0.32em] text-transparent uppercase antialiased md:text-[13px] md:tracking-[0.36em]">
                  {t("heroTagline")}
                </p>
              </div>
            </div>

            {/* CTAs */}
            <div className="animate-hero-fade-up flex gap-3 pt-2 [animation-delay:300ms] sm:gap-4">
              <Link
                href="/games"
                className={cn(
                  buttonVariants({ intent: "gold", size: "lg" }),
                  "px-8 text-sm sm:text-base",
                )}
              >
                <Compass className="mr-2 size-5" />
                {t("explore")}
              </Link>
              {user ? (
                <Link
                  href="/dashboard"
                  className={cn(
                    buttonVariants({ intent: "primary", size: "lg" }),
                    "px-8 text-sm sm:text-base",
                  )}
                >
                  <LayoutDashboard className="mr-2 size-5" />
                  {t("start")}
                </Link>
              ) : (
                <SignInButton
                  size="lg"
                  intent="primary"
                  label={t("join")}
                  className="text-sm sm:text-base"
                />
              )}
            </div>

            {/* Avatar + Welcome card (logged-in only) */}
            {user && (
              <div className="animate-hero-fade-up mt-16 [animation-delay:450ms]">
                <div className="glow-border-card animate-hero-float rounded-4xl px-5 py-3">
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
          <div className="communities-box border-gold-dim from-background-soft to-background relative z-20 rounded-t-[2.5rem] border border-b-0 bg-linear-to-b px-6 pt-10 pb-2 shadow-[0_-20px_80px_rgb(192_11_59/0.06),inset_0_1px_0_rgb(255_255_255/0.05)] sm:px-10 sm:pt-14 lg:px-12 lg:pt-16">
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
    leagueCount: game._count?.events || 0,
    playerCount: 0,
  }));

  return <GameShowcase games={gameList} labels={labels} />;
}
