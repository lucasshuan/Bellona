import Image from "next/image";
import { Link } from "@/i18n/routing";
import { notFound } from "next/navigation";
import { User as UserIcon, Medal, Trophy, Gamepad2 } from "lucide-react";
import { eq, or, sql, inArray } from "drizzle-orm";
import { cache } from "react";

import { getServerAuthSession } from "@/server/auth";
import { getTranslations } from "next-intl/server";
import { db } from "@/server/db";
import {
  players,
  rankingEntries as rankingEntriesSchema,
  users,
} from "@/server/db/schema";
import { buttonVariants } from "@/components/ui/button";

type ProfilePageProps = {
  params: Promise<{
    username: string;
  }>;
};

const getUser = cache(async (username: string) => {
  const targetUsers = await db
    .select()
    .from(users)
    .where(or(eq(users.username, username), eq(users.id, username)))
    .limit(1);

  return targetUsers[0] ?? null;
});

export async function generateMetadata({ params }: ProfilePageProps) {
  const t = await getTranslations("ProfilePage");
  const { username } = await params;

  const targetUser = await getUser(username);

  if (!targetUser) return { title: "User not found" };

  return {
    title: `${targetUser.username ?? targetUser.name} | ${t("headerTitle")}`,
  };
}

export default async function UserProfilePage({ params }: ProfilePageProps) {
  const session = await getServerAuthSession();
  const t = await getTranslations("ProfilePage");
  const { username } = await params;

  const targetUser = await getUser(username);

  if (!targetUser) {
    notFound();
  }

  const isOwnProfile = session?.user?.id === targetUser.id;

  const userPlayersData = await db.query.players.findMany({
    where: eq(players.userId, targetUser.id),
    with: {
      game: true,
      rankingEntries: {
        with: {
          ranking: true,
        },
      },
    },
  });

  const playerIds = userPlayersData.map((p) => p.id);

  const rankedSubquery = db
    .select({
      playerId: rankingEntriesSchema.playerId,
      rankingId: rankingEntriesSchema.rankingId,
      position:
        sql<number>`rank() over (partition by ${rankingEntriesSchema.rankingId} order by ${rankingEntriesSchema.currentElo} desc)`.as(
          "position",
        ),
    })
    .from(rankingEntriesSchema)
    .as("ranked_entries");

  const userRanks =
    playerIds.length > 0
      ? await db
          .select()
          .from(rankedSubquery)
          .where(inArray(rankedSubquery.playerId, playerIds))
      : [];

  const calculatedPositions = userPlayersData.map((player) => {
    const rankingsWithPos = player.rankingEntries.map((entry) => {
      const rankInfo = userRanks.find(
        (r) => r.playerId === player.id && r.rankingId === entry.rankingId,
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

  return (
    <main className="grid-surface min-h-screen">
      <div className="mx-auto mt-10 flex w-full max-w-7xl flex-col-reverse gap-8 px-6 pb-12 sm:px-10 lg:flex-row lg:gap-12 lg:px-12">
        {/* Main Content */}
        <div className="min-w-0 flex-1 space-y-6">
          <div className="border-b border-white/10">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <span className="border-primary text-primary flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap transition-all">
                <Gamepad2 className="size-4" />
                {t("playedGamesTab")}
              </span>
            </nav>
          </div>

          <section className="flex flex-col gap-6 pt-2">
            {calculatedPositions.length === 0 ? (
              <div className="glass-panel mt-4 flex flex-col items-center justify-center gap-4 rounded-[2rem] p-12 text-center">
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
                    className="glass-panel group relative flex flex-col overflow-hidden rounded-[2rem] transition-all duration-300 hover:scale-[1.02] hover:border-white/20"
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
                        <div className="h-full w-full bg-gradient-to-br from-white/5 to-transparent" />
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

        {/* Sidebar */}
        <aside className="w-full shrink-0 lg:w-[320px] xl:w-[360px]">
          <div className="glass-panel sticky top-28 overflow-hidden rounded-[2rem]">
            {/* Subtle gradient background decoration inside sidebar */}
            <div className="bg-primary/20 pointer-events-none absolute -top-10 -right-10 size-40 rounded-full blur-[50px]" />
            <div className="bg-secondary/10 pointer-events-none absolute -bottom-10 -left-10 size-40 rounded-full blur-[50px]" />

            <div className="relative z-10 flex flex-col items-center p-8 text-center">
              {targetUser.image ? (
                <Image
                  src={targetUser.image}
                  alt={targetUser.username ?? targetUser.name ?? "Avatar"}
                  width={140}
                  height={140}
                  className="size-32 rounded-full border-4 border-white/10 object-cover shadow-xl"
                />
              ) : (
                <div className="flex size-32 items-center justify-center rounded-full border-4 border-white/10 bg-white/5 shadow-xl">
                  <UserIcon className="size-14 text-white/50" />
                </div>
              )}

              <h1 className="mt-6 text-2xl font-bold tracking-tight">
                {targetUser.username ?? targetUser.name ?? t("fallbackUser")}
              </h1>

              {isOwnProfile && (
                <Link
                  href="/profile/edit"
                  className={buttonVariants({
                    intent: "secondary",
                    size: "sm",
                    className: "mt-5 w-full",
                  })}
                >
                  {t("manageAccount")}
                </Link>
              )}
            </div>

            <div className="border-t border-white/5 bg-white/5 p-6">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/5 bg-black/20 p-4 text-center transition-colors hover:bg-black/30">
                  <p className="text-muted font-mono text-[10px] tracking-wider uppercase">
                    {t("myGames")}
                  </p>
                  <p className="text-secondary mt-1 text-2xl font-medium">
                    {calculatedPositions.length}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/5 bg-black/20 p-4 text-center transition-colors hover:bg-black/30">
                  <p className="text-muted font-mono text-[10px] tracking-wider uppercase">
                    {t("ranking")}
                  </p>
                  <p className="text-secondary mt-1 flex h-8 items-center justify-center gap-1 text-xl font-medium">
                    <Trophy className="size-5 text-yellow-500/80" />
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
