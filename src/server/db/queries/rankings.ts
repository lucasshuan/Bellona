import "server-only";

import { and, asc, desc, eq, or, sql } from "drizzle-orm";
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
import type {
  FullRankingData,
  GamePageData,
  GroupedRankingEntry,
  PublicRanking,
} from "./types";

function buildGameVisibilityCondition(
  viewerId?: string,
  canManageGames = false,
) {
  if (canManageGames) {
    return undefined;
  }

  if (viewerId) {
    return or(eq(games.status, "approved"), eq(games.authorId, viewerId));
  }

  return eq(games.status, "approved");
}

export const getGamePageData = cache(
  async (
    gameSlug: string,
    viewerId?: string,
    canManageGames = false,
  ): Promise<GamePageData> => {
    try {
      const visibilityCondition = buildGameVisibilityCondition(
        viewerId,
        canManageGames,
      );

      const playerCounts = db
        .select({
          gameId: players.gameId,
          count: sql<number>`count(*)`.as("player_count"),
        })
        .from(players)
        .groupBy(players.gameId)
        .as("player_counts");

      const rankingCounts = db
        .select({
          gameId: rankings.gameId,
          count: sql<number>`count(*)`.as("ranking_count"),
        })
        .from(rankings)
        .groupBy(rankings.gameId)
        .as("ranking_counts");

      const [result] = await db
        .select({
          game: games,
          authorId: users.id,
          authorName: users.name,
          authorUsername: users.username,
          authorImage: users.image,
          rankingCount: sql<number>`COALESCE(${rankingCounts.count}, 0)`,
          playerCount: sql<number>`COALESCE(${playerCounts.count}, 0)`,
          tourneyCount: sql<number>`0`, // Placeholder for now
          postCount: sql<number>`0`, // Placeholder for now
        })
        .from(games)
        .leftJoin(users, eq(users.id, games.authorId))
        .leftJoin(playerCounts, eq(games.id, playerCounts.gameId))
        .leftJoin(rankingCounts, eq(games.id, rankingCounts.gameId))
        .where(
          and(
            eq(sql`lower(${games.slug})`, gameSlug.toLowerCase().trim()),
            visibilityCondition,
          ),
        )
        .limit(1);

      if (!result) {
        return null;
      }

      const game = {
        ...result.game,
        rankingCount: result.rankingCount,
        playerCount: result.playerCount,
        tourneyCount: result.tourneyCount,
        postCount: result.postCount,
      };
      const author =
        result.authorId && result.authorName
          ? {
              id: result.authorId,
              name: result.authorName,
              username: result.authorUsername,
              image: result.authorImage,
            }
          : null;

      const rows = await db
        .select({
          rankingId: rankings.id,
          rankingName: rankings.name,
          rankingSlug: rankings.slug,
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
        .where(eq(rankings.gameId, String(game.id)))
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
          slug: string;
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
              slug: row.rankingSlug,
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
              userId: null, // userId isn't in original rows for getGamePageData but in GroupedRankingEntry
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
          !entry.usernames.some(
            (username) => username.id === row.playerUsernameId,
          )
        ) {
          entry.usernames.push({
            id: row.playerUsernameId,
            username: row.playerUsername,
          });
        }
      }

      const rankingList: PublicRanking[] = Array.from(
        groupedRankings.values(),
      ).map((ranking) => {
        const entries = Array.from(ranking.entries.values())
          .sort((left, right) => {
            if (right.currentElo !== left.currentElo) {
              return right.currentElo - left.currentElo;
            }

            const leftPrimary =
              left.usernames.find(
                (username) => username.id === left.primaryUsernameId,
              )?.username ??
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
            userId: entry.userId, // Included even if null
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
          slug: ranking.slug,
          entries,
        };
      });

      return {
        game,
        author,
        rankings: rankingList,
        isDatabaseUnavailable: false,
      };
    } catch (error) {
      if (isDatabaseUnavailableError(error)) {
        return {
          game: null,
          author: null,
          rankings: [],
          isDatabaseUnavailable: true,
        };
      }

      throw error;
    }
  },
);

export const getRankingData = cache(
  async (
    gameSlug: string,
    rankingSlug: string,
    viewerId?: string,
    canManageGames = false,
  ): Promise<FullRankingData | null> => {
    try {
      const visibilityCondition = buildGameVisibilityCondition(
        viewerId,
        canManageGames,
      );

      const results = await db
        .select({
          ranking: rankings,
          game: games,
        })
        .from(rankings)
        .innerJoin(games, eq(rankings.gameId, games.id))
        .where(
          and(
            eq(sql`lower(${games.slug})`, gameSlug.toLowerCase().trim()),
            eq(sql`lower(${rankings.slug})`, rankingSlug.toLowerCase().trim()),
            visibilityCondition,
          ),
        )
        .limit(1);

      if (results.length === 0) return null;
      const { ranking, game } = results[0];

      const rows = await db
        .select({
          entryId: rankingEntries.id,
          currentElo: rankingEntries.currentElo,
          entryUpdatedAt: rankingEntries.updatedAt,
          playerId: players.id,
          userId: players.userId,
          country: players.country,
          primaryUsernameId: players.primaryUsernameId,
          playerUsernameId: playerUsernames.id,
          playerUsername: playerUsernames.username,
          accountUsername: users.username,
          accountName: users.name,
        })
        .from(rankingEntries)
        .leftJoin(players, eq(players.id, rankingEntries.playerId))
        .leftJoin(users, eq(users.id, players.userId))
        .leftJoin(playerUsernames, eq(playerUsernames.playerId, players.id))
        .where(eq(rankingEntries.rankingId, ranking.id))
        .orderBy(
          desc(rankingEntries.currentElo),
          asc(rankingEntries.updatedAt),
          asc(players.id),
          asc(playerUsernames.username),
        );

      const entriesMap = new Map<string, GroupedRankingEntry>();
      for (const row of rows) {
        let entry = entriesMap.get(row.entryId);
        if (!entry) {
          entry = {
            id: row.entryId,
            playerId: row.playerId!,
            userId: row.userId ?? null,
            country: row.country ?? null,
            currentElo: row.currentElo ?? 0,
            primaryUsernameId: row.primaryUsernameId ?? null,
            usernames: [],
            fallbackName:
              row.accountUsername ?? row.accountName ?? "Unknown player",
            updatedAt: row.entryUpdatedAt ?? null,
          };
          entriesMap.set(row.entryId, entry);
        }

        if (
          row.playerUsernameId &&
          row.playerUsername &&
          !entry.usernames.some((u) => u.id === row.playerUsernameId)
        ) {
          entry.usernames.push({
            id: row.playerUsernameId,
            username: row.playerUsername,
          });
        }
      }

      const sortedEntries = Array.from(entriesMap.values())
        .sort((left, right) => {
          if (right.currentElo !== left.currentElo) {
            return right.currentElo - left.currentElo;
          }

          const leftPrimary =
            left.usernames.find(
              (username) => username.id === left.primaryUsernameId,
            )?.username ??
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
          userId: entry.userId,
          country: entry.country,
          currentElo: entry.currentElo,
          position: index + 1,
          displayName:
            entry.usernames.find((u) => u.id === entry.primaryUsernameId)
              ?.username ??
            entry.usernames[0]?.username ??
            entry.fallbackName,
          usernames: entry.usernames.length
            ? entry.usernames.map((u) => u.username)
            : [entry.fallbackName],
        }));

      return {
        ranking,
        game,
        entries: sortedEntries,
      };
    } catch (error) {
      console.error(error);
      return null;
    }
  },
);
