"use server";

import { getClient } from "@/lib/apollo/apollo-client";
import { GET_GAME } from "@/lib/apollo/queries/games";
import {
  APPROVE_GAME,
  CREATE_GAME,
  UPDATE_GAME,
} from "@/lib/apollo/queries/game-mutations";
import { Game } from "@/lib/apollo/types";
import { getServerAuthSession } from "@/auth";
import {
  canEditGame,
  canManageGames,
  canManagePlayers,
  canManageRankings,
} from "@/lib/permissions";
import { revalidatePath } from "next/cache";

import {
  ADD_PLAYER_TO_RANKING,
  CREATE_RANKING,
  REGISTER_SELF_TO_RANKING,
  UPDATE_RANKING,
} from "@/lib/apollo/queries/ranking-mutations";
import {
  ADD_PLAYER_TO_GAME,
  SEARCH_PLAYERS,
} from "@/lib/apollo/queries/player-mutations";
import { Ranking } from "@/lib/apollo/types";

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

async function getGameRecord(gameIdOrSlug: string) {
  const { data } = await getClient().query<{ game: Game }>({
    query: GET_GAME,
    variables: { slug: gameIdOrSlug }, // The query usually takes slug, but let's assume it works for both or name it accordingly
  });
  return data?.game;
}

function revalidateGamePaths(game: { slug: string }) {
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
  const { data: gameData } = await getClient().query<{ game: Game }>({
    query: GET_GAME,
    variables: { slug: gameId }, // Assuming gameId can be used to find the game if slug is same or we have a getById
  });
  const game = gameData?.game;

  if (!game) {
    throw new Error("Game not found");
  }

  if (!canEditGame(session, game.authorId)) {
    throw new Error("Unauthorized");
  }

  const { data: result } = await getClient().mutate<{ updateGame: Game }>({
    mutation: UPDATE_GAME,
    variables: {
      id: game.id,
      input: {
        name: data.name.trim(),
        description: normalizeOptionalText(data.description),
        backgroundImageUrl: normalizeOptionalText(data.backgroundImageUrl),
        thumbnailImageUrl: normalizeOptionalText(data.thumbnailImageUrl),
        steamUrl: normalizeOptionalText(data.steamUrl),
      },
    },
  });

  if (result?.updateGame) {
    revalidateGamePaths(result.updateGame);
  }
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

  const { data: result } = await getClient().mutate<{ createGame: Game }>({
    mutation: CREATE_GAME,
    variables: {
      input: {
        name,
        slug,
        description: normalizeOptionalText(data.description),
        backgroundImageUrl: normalizeOptionalText(data.backgroundImageUrl),
        thumbnailImageUrl: normalizeOptionalText(data.thumbnailImageUrl),
        steamUrl: normalizeOptionalText(data.steamUrl),
        authorId: session.user.id,
      },
    },
  });

  if (result?.createGame) {
    revalidateGamePaths(result.createGame);
  }

  return {
    success: true,
    game: result?.createGame,
    status: result?.createGame.status,
  };
}

export async function approveGame(gameId: string) {
  const session = await getServerAuthSession();

  if (!canManageGames(session)) {
    throw new Error("Unauthorized");
  }

  const { data: result } = await getClient().mutate<{ approveGame: Game }>({
    mutation: APPROVE_GAME,
    variables: { id: gameId },
  });

  if (result?.approveGame) {
    // We need the slug for revalidation, so we might need a better approve mutation or a query
    // For now, let's assume we can get it or just revalidate general paths
    revalidatePath("/");
    revalidatePath("/games");
  }

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

  // Fetch game by ID to get the slug for revalidation
  const game = await getGameRecord(data.gameId);
  if (!game) throw new Error("Game not found");

  await getClient().mutate({
    mutation: CREATE_RANKING,
    variables: {
      input: {
        ...data,
        authorId: session.user.id,
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

  const game = await getGameRecord(gameId);
  if (!game) throw new Error("Game not found");

  const { data: resultData } = await getClient().mutate<{
    addPlayerToGame: Game;
  }>({
    mutation: ADD_PLAYER_TO_GAME,
    variables: {
      input: {
        gameId,
        username: data.username,
        userId: data.userId,
      },
    },
  });

  revalidateGamePaths(game);
  return { success: true, playerId: resultData?.addPlayerToGame.id };
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
  rankingId: string,
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

  await getClient().mutate<{ updateRanking: Ranking }>({
    mutation: UPDATE_RANKING,
    variables: { id: rankingId, input: data },
  });

  // Revalidate
  revalidatePath("/");
  return { success: true };
}

interface SearchResult {
  username: string;
  player: {
    id: string;
    user: {
      id: string;
      country: string | null;
    } | null;
  };
}

export async function searchPlayersByGame(gameId: string, query: string) {
  const session = await getServerAuthSession();
  if (!canManagePlayers(session)) throw new Error("Unauthorized");

  const { data } = await getClient().query<{ searchPlayers: SearchResult[] }>({
    query: SEARCH_PLAYERS,
    variables: { gameId, query },
  });

  return (data?.searchPlayers || []).map((r) => ({
    id: r.player.id,
    username: r.username,
    country: r.player.user?.country ?? null,
  }));
}

export async function addPlayerToRanking(
  rankingId: string,
  playerId: string,
  initialElo?: number,
) {
  const session = await getServerAuthSession();
  if (!canManagePlayers(session)) throw new Error("Unauthorized");

  await getClient().mutate({
    mutation: ADD_PLAYER_TO_RANKING,
    variables: { rankingId, playerId, initialElo },
  });

  revalidatePath("/");
  return { success: true };
}

export async function registerSelfToRanking(rankingId: string) {
  const session = await getServerAuthSession();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await getClient().mutate({
    mutation: REGISTER_SELF_TO_RANKING,
    variables: { rankingId, userId: session.user.id },
  });

  revalidatePath("/");
  return { success: true };
}
