import Image from "next/image";
import { Link } from "@/i18n/routing";
import { notFound } from "next/navigation";
import {
  User as UserIcon,
  Medal,
  Gamepad2,
  Edit2,
  Calendar,
} from "lucide-react";
import { cache } from "react";

import { getServerAuthSession } from "@/server/auth";
import { getTranslations } from "next-intl/server";
import { db } from "@/server/db";
import { buttonVariants } from "@/components/ui/button";
import { EditProfileTrigger } from "@/components/triggers/profile/edit-profile-trigger";
import { ActionButton } from "@/components/ui/action-button";
import { ProfileTabs } from "@/components/ui/tabs";

type ProfilePageProps = {
  params: Promise<{
    username: string;
    locale: string;
  }>;
};

const getUser = cache(async (username: string) => {
  return await db.user.findFirst({
    where: {
      OR: [{ username: username }, { id: username }],
    },
  });
});

export async function generateMetadata({ params }: ProfilePageProps) {
  const t = await getTranslations("ProfilePage");
  const { username } = await params;

  const targetUser = await getUser(username);

  if (!targetUser) return { title: "User not found" };

  return {
    title: `${targetUser.name ?? targetUser.username} | ${t("headerTitle")}`,
  };
}

export default async function UserProfilePage({ params }: ProfilePageProps) {
  const session = await getServerAuthSession();
  const t = await getTranslations("ProfilePage");
  const tModals = await getTranslations("Modals");
  const { username, locale } = await params;

  const targetUser = await getUser(username);

  if (!targetUser) {
    notFound();
  }

  const isOwnProfile = session?.user?.id === targetUser.id;

  const userPlayersData = await db.player.findMany({
    where: { userId: targetUser.id },
    include: {
      game: true,
      rankingEntries: {
        include: {
          ranking: true,
        },
      },
    },
  });

  const playerIds = userPlayersData.map((p) => p.id);

  // Use raw query for rank() window function as Prisma doesn't support it natively yet
  interface UserRankRecord {
    player_id: string;
    event_id: string;
    position: bigint;
  }

  const userRanks =
    playerIds.length > 0
      ? await db.$queryRaw<UserRankRecord[]>`
          SELECT player_id, event_id, position FROM (
            SELECT 
              player_id, 
              event_id, 
              RANK() OVER (PARTITION BY event_id ORDER BY current_elo DESC) as position
            FROM ranking_entries
          ) ranked_entries
          WHERE player_id IN (${playerIds.join(",")})
        `
      : [];

  const calculatedPositions = userPlayersData.map((player) => {
    const rankingsWithPos = player.rankingEntries.map((entry) => {
      const rankInfo = userRanks.find(
        (r) => r.player_id === player.id && r.event_id === entry.rankingId,
      );
      return {
        ...entry,
        position: rankInfo ? Number(rankInfo.position) : 0,
      };
    });
    return {
      ...player,
      rankingEntries: rankingsWithPos,
    };
  });

  const finalProfileColor = targetUser.profileColor || "#c00b3b";

  return (
    <main
      className="relative min-h-screen overflow-hidden"
      style={
        {
          "--primary": finalProfileColor,
          "--primary-strong": `color-mix(in srgb, ${finalProfileColor}, black 35%)`,
          "--primary-light": `color-mix(in srgb, ${finalProfileColor}, white 10%)`,
          "--color-primary": finalProfileColor,
          "--color-primary-strong": `color-mix(in srgb, ${finalProfileColor}, black 35%)`,
          "--border": `color-mix(in srgb, ${finalProfileColor} 18%, transparent)`,
          "--color-border": `color-mix(in srgb, ${finalProfileColor} 18%, transparent)`,
        } as React.CSSProperties
      }
    >
      {/* Background Glows & Floating Blobs */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 aspect-square w-150 rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--primary)_15%,transparent)_0%,transparent_70%)] blur-[80px]" />
        <div className="absolute top-1/2 -right-24 aspect-square w-120 rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--primary)_10%,transparent)_0%,transparent_70%)] blur-[60px]" />

        {/* Animated Blobs with Breathing Effect */}
        <div className="animate-float animate-breathe bg-primary/20 absolute top-[10%] left-[5%] h-64 w-64 rounded-full blur-[80px]" />
        <div
          className="animate-float-slow animate-breathe bg-primary/10 absolute top-[55%] right-[5%] h-[450px] w-[450px] rounded-full blur-[120px]"
          style={{ animationDelay: "-2s" }}
        />
        <div
          className="animate-float animate-breathe bg-primary/15 absolute bottom-[5%] left-[20%] h-80 w-80 rounded-full blur-[90px]"
          style={{ animationDelay: "-5s", animationDuration: "17s" }}
        />
        <div
          className="animate-float-slow animate-breathe bg-primary/30 absolute top-[25%] left-[45%] h-32 w-32 rounded-full blur-[50px]"
          style={{ animationDelay: "-1.5s" }}
        />
        <div
          className="animate-float animate-breathe bg-primary/10 absolute right-[20%] bottom-[35%] h-72 w-72 rounded-full blur-[100px]"
          style={{ animationDelay: "-4s" }}
        />
      </div>

      {/* Profile Header Background */}
      <div
        className="pointer-events-none absolute top-0 right-0 left-0 z-0 h-40 overflow-hidden"
        style={{ backgroundColor: "var(--primary-strong)" }}
      >
        <div
          className="animate-float-slow absolute -top-1/2 -left-1/4 h-[200%] w-[150%] opacity-50"
          style={{
            background: `radial-gradient(circle at center, var(--primary-light) 0%, transparent 70%)`,
            filter: "blur(40px)",
          }}
        />
        <div
          className="animate-float absolute -right-1/4 -bottom-1/2 h-[150%] w-[120%] opacity-30"
          style={{
            background: `radial-gradient(circle at center, var(--primary) 0%, transparent 60%)`,
            filter: "blur(60px)",
            animationDirection: "reverse",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col-reverse gap-8 px-6 pt-16 pb-12 sm:px-10 lg:flex-row lg:gap-8 lg:px-12">
        {/* Sidebar */}
        <aside className="w-full shrink-0 lg:w-[320px] xl:w-[360px]">
          <div className="sticky top-28 flex flex-col gap-4">
            <div className="glass-panel overflow-hidden rounded-4xl">
              {/* Subtle gradient background decoration inside sidebar */}
              <div className="bg-primary/20 pointer-events-none absolute -top-10 -right-10 size-40 rounded-full blur-[50px]" />
              <div className="bg-secondary/10 pointer-events-none absolute -bottom-10 -left-10 size-40 rounded-full blur-[50px]" />

              <div className="relative z-10 flex flex-col items-center p-8 text-center">
                {targetUser.image ? (
                  <Image
                    src={targetUser.image}
                    alt={targetUser.name ?? targetUser.username ?? "Avatar"}
                    width={140}
                    height={140}
                    className="size-32 rounded-full object-cover shadow-xl"
                  />
                ) : (
                  <div className="flex size-32 items-center justify-center rounded-full bg-white/5 shadow-xl">
                    <UserIcon className="size-14 text-white/50" />
                  </div>
                )}

                <h1 className="mt-6 text-2xl font-bold tracking-tight">
                  {targetUser.name ?? targetUser.username ?? t("fallbackUser")}
                </h1>

                {targetUser.bio ? (
                  <p className="mt-6 max-w-[280px] text-sm leading-relaxed text-white/60">
                    {targetUser.bio}
                  </p>
                ) : isOwnProfile ? (
                  <p className="mt-6 text-xs text-white/30 italic">
                    Você ainda não definiu uma biografia.
                  </p>
                ) : null}

                <div className="mt-6 flex items-center gap-2 text-xs font-medium text-white/40">
                  <Calendar className="size-3.5" />
                  <span>
                    {t("joined")}{" "}
                    {new Intl.DateTimeFormat(locale, {
                      month: "long",
                      year: "numeric",
                    }).format(new Date(targetUser.createdAt))}
                  </span>
                </div>
              </div>
            </div>

            {isOwnProfile && (
              <EditProfileTrigger user={targetUser}>
                <ActionButton
                  icon={Edit2}
                  label={tModals("EditProfile.trigger")}
                />
              </EditProfileTrigger>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <div className="mt-16 min-w-0 flex-1 space-y-6 lg:mt-24">
          <div className="space-y-4">
            <ProfileTabs
              tabs={[
                {
                  id: "games",
                  label: t("playedGamesTab"),
                  icon: Gamepad2,
                  active: true,
                },
              ]}
            />

            <section className="flex flex-col gap-6">
              {calculatedPositions.length === 0 ? (
                <div className="glass-panel mt-6 flex flex-col items-center justify-center gap-4 rounded-4xl p-12 text-center">
                  <Medal className="size-12 text-white" />
                  <div>
                    <h3 className="text-xl font-medium">
                      {isOwnProfile ? t("noGames") : t("noGamesOther")}
                    </h3>
                    <p className="text-muted mt-2 max-w-md text-sm">
                      {isOwnProfile
                        ? t("noGamesDescription")
                        : t("noGamesDescriptionOther")}
                    </p>
                  </div>
                  {isOwnProfile && (
                    <Link
                      href="/games"
                      className={buttonVariants({
                        intent: "primary",
                        className: "mt-4",
                      })}
                    >
                      {t("viewGames")}
                    </Link>
                  )}
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  {calculatedPositions.map((player) => (
                    <Link
                      key={player.id}
                      href={`/games/${player.game.slug}`}
                      className="glass-panel group relative flex flex-col overflow-hidden rounded-4xl transition-all duration-300 hover:scale-[1.02] hover:border-white/20"
                    >
                      <div className="h-32 w-full overflow-hidden bg-white/5 sm:h-40">
                        {player.game.backgroundImageUrl ? (
                          <Image
                            src={player.game.backgroundImageUrl}
                            alt={player.game.name}
                            width={600}
                            height={300}
                            className="h-full w-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-105 group-hover:opacity-80"
                          />
                        ) : (
                          <div className="h-full w-full bg-linear-to-br from-white/5 to-transparent" />
                        )}
                      </div>

                      <div className="flex flex-1 flex-col p-6">
                        <h3 className="text-xl font-bold tracking-tight">
                          {player.game.name}
                        </h3>

                        <div className="mt-4 flex flex-col gap-3">
                          {player.rankingEntries.length > 0 ? (
                            player.rankingEntries.map((entry) => (
                              <div
                                key={entry.id}
                                className="flex items-center justify-between rounded-xl bg-white/5 p-4 transition-colors group-hover:bg-white/10"
                              >
                                <div>
                                  <p className="text-xs tracking-wider text-white/50 uppercase">
                                    {t("ranking")}
                                  </p>
                                  <p className="font-medium">
                                    {entry.ranking.name}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-primary font-mono text-xs tracking-wider uppercase">
                                    Elo {entry.currentElo}
                                  </p>
                                  <p className="text-lg font-semibold tracking-tight">
                                    #{entry.position}
                                  </p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-white/40 italic">
                              Sem posições em rankings ainda.
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
