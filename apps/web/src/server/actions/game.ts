"use server";

import { db } from "@/server/db";
import { type Game } from "@ares/db";
import { getServerAuthSession } from "@/server/auth";
import {
  canEditGame,
  canManageGames,
  canManagePlayers,
  canManageRankings,
} from "@/lib/permissions";
import { revalidatePath } from "next/cache";

function normalizeOptionalText(value: string | null | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

async function getGameRecord(gameId: string) {
  return await db.game.findFirst({
    where: { id: gameId },
  });
}

async function assertGameApproved(gameId: string) {
  const game = await getGameRecord(gameId);

  if (!game) {
    throw new Error("Game not found");
  }

  if (game.status !== "APPROVED") {
    throw new Error("Pending games cannot receive rankings or players");
  }

  return game;
}

function revalidateGamePaths(game: Pick<Game, "slug">) {
  revalidatePath("/");
  revalidatePath("/games");
  revalidatePath(`/games/${game.slug}`);
}

export async function updateGame(
  gameId: string,
  data: {
    name: string;
    description: string | null;
    backgroundImageUrl: string | null;
    thumbnailImageUrl: string | null;
    steamUrl: string | null;
  },
) {
  const session = await getServerAuthSession();
  const game = await getGameRecord(gameId);

  if (!game) {
    throw new Error("Game not found");
  }

  if (!canEditGame(session, game.authorId)) {
    throw new Error("Unauthorized");
  }

  const updatedGame = await db.game.update({
    where: { id: gameId },
    data: {
      name: data.name.trim(),
      description: normalizeOptionalText(data.description),
      backgroundImageUrl: normalizeOptionalText(data.backgroundImageUrl),
      thumbnailImageUrl: normalizeOptionalText(data.thumbnailImageUrl),
      steamUrl: normalizeOptionalText(data.steamUrl),
    },
  });

  revalidateGamePaths(updatedGame);
  return { success: true };
}

export async function createGame(data: {
  name: string;
  slug: string;
  description: string | null;
  backgroundImageUrl: string | null;
  thumbnailImageUrl: string | null;
  steamUrl: string | null;
}) {
  const session = await getServerAuthSession();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const name = data.name.trim();
  const slug = slugify(data.slug || data.name);

  if (!name || !slug) {
    throw new Error("Invalid game data");
  }

  const status = canManageGames(session) ? "APPROVED" : "PENDING";

  const game = await db.game.create({
    data: {
      name,
      slug,
      description: normalizeOptionalText(data.description),
      backgroundImageUrl: normalizeOptionalText(data.backgroundImageUrl),
      thumbnailImageUrl: normalizeOptionalText(data.thumbnailImageUrl),
      steamUrl: normalizeOptionalText(data.steamUrl),
      status,
      authorId: session.user.id,
    },
  });

  revalidateGamePaths(game);

  return {
    success: true,
    game,
    status,
  };
}

export async function approveGame(gameId: string) {
  const session = await getServerAuthSession();

  if (!canManageGames(session)) {
    throw new Error("Unauthorized");
  }

  const game = await getGameRecord(gameId);

  if (!game) {
    throw new Error("Game not found");
  }

  const updatedGame = await db.game.update({
    where: { id: gameId },
    data: {
      status: "APPROVED",
    },
  });

  revalidateGamePaths(updatedGame);

  return { success: true };
}

export async function addRanking(data: {
  gameId: string;
  name: string;
  slug: string;
  description: string | null;
  initialElo: number;
  ratingSystem: string;
  allowDraw: boolean;
  kFactor: number;
  scoreRelevance: number;
  inactivityDecay: number;
  inactivityThresholdHours: number;
  inactivityDecayFloor: number;
  pointsPerWin: number;
  pointsPerDraw: number;
  pointsPerLoss: number;
  startDate: Date | null;
  endDate: Date | null;
}) {
  const session = await getServerAuthSession();
  if (!session?.user) throw new Error("Unauthorized");

  const game = await assertGameApproved(data.gameId);

  // In the new schema, a Ranking is an extension of an Event
  const isApproved = canManageRankings(session);

  await db.event.create({
    data: {
      gameId: data.gameId,
      type: "RANKING",
      status: isApproved ? "ACTIVE" : "PENDING",
      name: data.name,
      slug: data.slug,
      description: data.description,
      startDate: data.startDate,
      endDate: data.endDate,
      authorId: session.user.id,
      ranking: {
        create: {
          initialElo: data.initialElo,
          ratingSystem: data.ratingSystem,
          allowDraw: data.allowDraw,
          kFactor: data.kFactor,
          scoreRelevance: data.scoreRelevance,
          inactivityDecay: data.inactivityDecay,
          inactivityThresholdHours: data.inactivityThresholdHours,
          inactivityDecayFloor: data.inactivityDecayFloor,
          pointsPerWin: data.pointsPerWin,
          pointsPerDraw: data.pointsPerDraw,
          pointsPerLoss: data.pointsPerLoss,
        },
      },
    },
  });

  revalidateGamePaths(game);
  return { success: true };
}

export async function addPlayerToGame(
  gameId: string,
  data: {
    username: string;
    userId: string | null;
  },
) {
  const session = await getServerAuthSession();
  if (!canManagePlayers(session)) throw new Error("Unauthorized");

  const game = await assertGameApproved(gameId);

  const result = await db.$transaction(async (tx) => {
    let playerId: string | null = null;
    let wasAddedToExisting = false;

    if (data.userId) {
      const existingPlayer = await tx.player.findFirst({
        where: { gameId: gameId, userId: data.userId },
      });

      if (existingPlayer) {
        playerId = existingPlayer.id;
        wasAddedToExisting = true;
      }
    }

    if (!playerId) {
      const newPlayer = await tx.player.create({
        data: {
          gameId,
          userId: data.userId,
        },
      });
      playerId = newPlayer.id;
    }

    const newUsername = await tx.playerUsername.create({
      data: {
        playerId,
        username: data.username,
      },
    });

    // If we just created a new player, set the first username as primary
    if (!wasAddedToExisting) {
      await tx.player.update({
        where: { id: playerId },
        data: { primaryUsernameId: newUsername.id },
      });
    }

    return { wasAddedToExisting, playerId };
  });

  revalidateGamePaths(game);
  return { success: true, ...result };
}

export async function createAndAddPlayerToRanking(
  gameId: string,
  rankingId: string,
  username: string,
) {
  const result = await addPlayerToGame(gameId, {
    username,
    userId: null,
  });

  if (result.success && result.playerId) {
    return await addPlayerToRanking(rankingId, result.playerId);
  }

  return { success: false };
}

export async function updateRanking(
  rankingId: string, // This is eventId in the new schema
  data: {
    name: string;
    slug: string;
    description: string | null;
    initialElo: number;
    ratingSystem: string;
    allowDraw: boolean;
    kFactor: number;
    scoreRelevance: number;
    inactivityDecay: number;
    inactivityThresholdHours: number;
    inactivityDecayFloor: number;
    pointsPerWin: number;
    pointsPerDraw: number;
    pointsPerLoss: number;
  },
) {
  const session = await getServerAuthSession();
  if (!canManageRankings(session)) throw new Error("Unauthorized");

  await db.event.update({
    where: { id: rankingId },
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description,
      ranking: {
        update: {
          initialElo: data.initialElo,
          ratingSystem: data.ratingSystem,
          allowDraw: data.allowDraw,
          kFactor: data.kFactor,
          scoreRelevance: data.scoreRelevance,
          inactivityDecay: data.inactivityDecay,
          inactivityThresholdHours: data.inactivityThresholdHours,
          inactivityDecayFloor: data.inactivityDecayFloor,
          pointsPerWin: data.pointsPerWin,
          pointsPerDraw: data.pointsPerDraw,
          pointsPerLoss: data.pointsPerLoss,
        },
      },
    },
  });

  const event = await db.event.findFirst({
    where: { id: rankingId },
    include: { game: true },
  });

  if (event?.game) {
    revalidateGamePaths(event.game);
    revalidatePath(`/games/${event.game.slug}/rankings/${event.slug}`);
  }

  return { success: true };
}

export async function searchPlayersByGame(gameId: string, query: string) {
  const session = await getServerAuthSession();
  if (!canManagePlayers(session)) throw new Error("Unauthorized");

  await assertGameApproved(gameId);

  const results = await db.playerUsername.findMany({
    where: {
      username: {
        contains: query,
        mode: "insensitive",
      },
      player: {
        gameId: gameId,
      },
    },
    include: {
      player: {
        include: {
          user: true,
        },
      },
    },
    take: 10,
  });

  return results.map((r) => ({
    id: r.player.id,
    username: r.username,
    country: r.player.user?.country ?? null,
  }));
}

export async function addPlayerToRanking(
  rankingId: string, // eventId
  playerId: string,
  initialElo?: number,
) {
  const session = await getServerAuthSession();
  if (!canManagePlayers(session)) throw new Error("Unauthorized");

  const event = await db.event.findFirst({
    where: { id: rankingId },
    include: {
      game: true,
      ranking: true,
    },
  });

  if (!event || !event.ranking) throw new Error("Ranking not found");
  if (!event.game || event.game.status !== "APPROVED") {
    throw new Error("Pending games cannot receive rankings or players");
  }

  await db.rankingEntry.create({
    data: {
      rankingId,
      playerId,
      currentElo: initialElo ?? event.ranking.initialElo,
    },
  });

  revalidateGamePaths(event.game);
  revalidatePath(`/games/${event.game.slug}/rankings/${event.slug}`);

  return { success: true };
}

export async function registerSelfToRanking(rankingId: string) {
  const session = await getServerAuthSession();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const event = await db.event.findFirst({
    where: { id: rankingId },
    include: {
      game: true,
      ranking: true,
    },
  });

  if (!event || !event.ranking) throw new Error("Ranking not found");
  if (!event.game || event.game.status !== "APPROVED") {
    throw new Error("Pending games cannot receive rankings or players");
  }

  // Check if player already exists for this game and user
  let player = await db.player.findFirst({
    where: {
      gameId: event.gameId,
      userId: session.user.id,
    },
  });

  if (!player) {
    // Create player record
    player = await db.player.create({
      data: {
        gameId: event.gameId,
        userId: session.user.id,
      },
    });

    // Add initial username from profile
    const newUsername = await db.playerUsername.create({
      data: {
        playerId: player.id,
        username: session.user.name || "Player",
      },
    });

    // Set as primary username
    await db.player.update({
      where: { id: player.id },
      data: { primaryUsernameId: newUsername.id },
    });
  }

  // Check if already in ranking
  const existingEntry = await db.rankingEntry.findFirst({
    where: {
      rankingId: rankingId,
      playerId: player.id,
    },
  });

  if (existingEntry) return { success: true, alreadyRegistered: true };

  await db.rankingEntry.create({
    data: {
      rankingId,
      playerId: player.id,
      currentElo: event.ranking.initialElo,
    },
  });

  revalidateGamePaths(event.game);
  revalidatePath(`/games/${event.game.slug}/rankings/${event.slug}`);

  return { success: true };
}
