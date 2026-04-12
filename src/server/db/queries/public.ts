import "server-only";

import { asc, desc, eq } from "drizzle-orm";
import { cache } from "react";

import { db } from "@/server/db";
import { isDatabaseUnavailableError } from "@/server/db/errors";
import {
  games,
  players,
  playerUsernames,
  rankingEntries,
  rankings,
  users,
} from "@/server/db/schema";

type GroupedRankingEntry = {
  id: string;
  playerId: string;
  country: string | null;
  currentElo: number;
  primaryUsernameId: string | null;
  usernames: Array<{
    id: string;
    username: string;
  }>;
  fallbackName: string;
  updatedAt: Date | null;
};

export type PublicGame = typeof games.$inferSelect;

export type PublicRankingEntry = {
  id: string;
  playerId: string;
  country: string | null;
  currentElo: number;
  position: number;
  displayName: string;
  usernames: string[];
};

export type PublicRanking = {
  id: string;
  name: string;
  entries: PublicRankingEntry[];
};

export type PublicGamesState = {
  games: PublicGame[];
  isDatabaseUnavailable: boolean;
};

export type GamePageData =
  | {
      game: typeof games.$inferSelect;
      rankings: PublicRanking[];
      isDatabaseUnavailable: false;
    }
  | {
      game: null;
      rankings: [];
      isDatabaseUnavailable: true;
    }
  | null;

export const getPublicGames = cache(async () => {
  try {
    const gameList = await db
      .select({
        id: games.id,
        name: games.name,
        description: games.description,
        thumbnailImageUrl: games.thumbnailImageUrl,
        backgroundImageUrl: games.backgroundImageUrl,
        createdAt: games.createdAt,
        updatedAt: games.updatedAt,
      })
      .from(games)
      .orderBy(asc(games.name));

    return {
      games: gameList,
      isDatabaseUnavailable: false,
    } satisfies PublicGamesState;
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      return {
        games: [],
        isDatabaseUnavailable: true,
      } satisfies PublicGamesState;
    }

    throw error;
  }
});

export const getGamePageData = cache(async (gameId: string): Promise<GamePageData> => {
  try {
    const [game] = await db
      .select()
      .from(games)
      .where(eq(games.id, gameId))
      .limit(1);

    if (!game) {
      return null;
    }

    const rows = await db
      .select({
        rankingId: rankings.id,
        rankingName: rankings.name,
        entryId: rankingEntries.id,
        currentElo: rankingEntries.currentElo,
        entryUpdatedAt: rankingEntries.updatedAt,
        playerId: players.id,
        country: players.country,
        primaryUsernameId: players.primaryUsernameId,
        playerUsernameId: playerUsernames.id,
        playerUsername: playerUsernames.username,
        accountUsername: users.username,
        accountName: users.name,
      })
      .from(rankings)
      .leftJoin(rankingEntries, eq(rankingEntries.rankingId, rankings.id))
      .leftJoin(players, eq(players.id, rankingEntries.playerId))
      .leftJoin(users, eq(users.id, players.userId))
      .leftJoin(playerUsernames, eq(playerUsernames.playerId, players.id))
      .where(eq(rankings.gameId, game.id))
      .orderBy(
        asc(rankings.name),
        desc(rankingEntries.currentElo),
        asc(rankingEntries.updatedAt),
        asc(players.id),
        asc(playerUsernames.username),
      );

    const groupedRankings = new Map<
      string,
      {
        id: string;
        name: string;
        entries: Map<string, GroupedRankingEntry>;
      }
    >();

    for (const row of rows) {
      const existingRanking = groupedRankings.get(row.rankingId);
      const ranking =
        existingRanking ??
        (() => {
          const created = {
            id: row.rankingId,
            name: row.rankingName,
            entries: new Map<string, GroupedRankingEntry>(),
          };

          groupedRankings.set(row.rankingId, created);
          return created;
        })();

      if (!row.entryId || !row.playerId) {
        continue;
      }

      const existingEntry = ranking.entries.get(row.entryId);
      const entry =
        existingEntry ??
        (() => {
          const created = {
            id: row.entryId,
            playerId: row.playerId!,
            country: row.country ?? null,
            currentElo: row.currentElo ?? 0,
            primaryUsernameId: row.primaryUsernameId ?? null,
            usernames: [] as Array<{
              id: string;
              username: string;
            }>,
            fallbackName:
              row.accountUsername ?? row.accountName ?? "Unknown player",
            updatedAt: row.entryUpdatedAt ?? null,
          };

          ranking.entries.set(row.entryId, created);
          return created;
        })();

      if (
        row.playerUsernameId &&
        row.playerUsername &&
        !entry.usernames.some((username) => username.id === row.playerUsernameId)
      ) {
        entry.usernames.push({
          id: row.playerUsernameId,
          username: row.playerUsername,
        });
      }
    }

    const rankingList: PublicRanking[] = Array.from(groupedRankings.values()).map(
      (ranking) => {
        const entries = Array.from(ranking.entries.values())
          .sort((left, right) => {
            if (right.currentElo !== left.currentElo) {
              return right.currentElo - left.currentElo;
            }

            const leftPrimary =
              left.usernames.find((username) => username.id === left.primaryUsernameId)
                ?.username ??
              left.usernames[0]?.username ??
              left.fallbackName;
            const rightPrimary =
              right.usernames.find(
                (username) => username.id === right.primaryUsernameId,
              )?.username ??
              right.usernames[0]?.username ??
              right.fallbackName;

            return leftPrimary.localeCompare(rightPrimary);
          })
          .map((entry, index) => ({
            id: entry.id,
            playerId: entry.playerId,
            country: entry.country,
            currentElo: entry.currentElo,
            position: index + 1,
            displayName:
              entry.usernames.find(
                (username) => username.id === entry.primaryUsernameId,
              )?.username ??
              entry.usernames[0]?.username ??
              entry.fallbackName,
            usernames: entry.usernames.length
              ? entry.usernames.map((username) => username.username)
              : [entry.fallbackName],
          }));

        return {
          id: ranking.id,
          name: ranking.name,
          entries,
        };
      },
    );

    return {
      game,
      rankings: rankingList,
      isDatabaseUnavailable: false,
    };
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      return {
        game: null,
        rankings: [],
        isDatabaseUnavailable: true,
      };
    }

    throw error;
  }
});
