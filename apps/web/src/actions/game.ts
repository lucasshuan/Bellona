"use server";

import { getClient } from "@/lib/apollo/apollo-client";
import { GET_GAME } from "@/lib/apollo/queries/games";
import {
  APPROVE_GAME,
  CREATE_GAME,
  UPDATE_GAME,
} from "@/lib/apollo/queries/game-mutations";
import {
  GetGameQuery,
  UpdateGameMutation,
  CreateGameMutation,
  ApproveGameMutation,
  CreateLeagueMutation,
  AddPlayerToGameMutation,
  UpdateLeagueMutation,
  SearchPlayersQuery,
  RegisterSelfToLeagueMutation,
} from "@/lib/apollo/generated/graphql";
import { getServerAuthSession } from "@/auth";
import {
  canEditGame,
  canManageGames,
  canManagePlayers,
  canManageLeagues,
} from "@/lib/permissions";
import { revalidatePath } from "next/cache";
import { normalizeOptionalText, slugify } from "@/lib/utils";
import { createSafeAction } from "@/lib/action-utils";

import {
  ADD_PLAYER_TO_LEAGUE,
  CREATE_LEAGUE,
  REGISTER_SELF_TO_LEAGUE,
  UPDATE_LEAGUE,
} from "@/lib/apollo/queries/league-mutations";
import {
  ADD_PLAYER_TO_GAME,
  SEARCH_PLAYERS,
} from "@/lib/apollo/queries/player-mutations";

async function getGameRecord(gameIdOrSlug: string) {
  const { data } = await getClient().query<GetGameQuery>({
    query: GET_GAME,
    variables: { slug: gameIdOrSlug },
  });
  return data?.game;
}

function revalidateGamePaths(game: { slug: string }) {
  revalidatePath("/");
  revalidatePath("/games");
  revalidatePath(`/games/${game.slug}`);
}

export const updateGame = createSafeAction(
  "updateGame",
  async (
    gameId: string,
    data: {
      name: string;
      description: string | null;
      backgroundImageUrl: string | null;
      thumbnailImageUrl: string | null;
      steamUrl: string | null;
    },
  ) => {
    const session = await getServerAuthSession();
    const { data: gameData } = await getClient().query<GetGameQuery>({
      query: GET_GAME,
      variables: { slug: gameId },
    });
    const game = gameData?.game;

    if (!game) {
      throw new Error("Game not found");
    }

    if (!canEditGame(session, game.authorId)) {
      throw new Error("Unauthorized");
    }

    const { data: result } = await getClient().mutate<UpdateGameMutation>({
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
    return true;
  },
);

export const createGame = createSafeAction(
  "createGame",
  async (data: {
    name: string;
    slug: string;
    description: string | null;
    backgroundImageUrl: string | null;
    thumbnailImageUrl: string | null;
    steamUrl: string | null;
  }) => {
    const session = await getServerAuthSession();

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const name = data.name.trim();
    const slug = slugify(data.slug || data.name);

    if (!name || !slug) {
      throw new Error("Invalid game data");
    }

    const { data: result } = await getClient().mutate<CreateGameMutation>({
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
      game: result?.createGame,
      status: result?.createGame.status,
    };
  },
);

export const approveGame = createSafeAction(
  "approveGame",
  async (gameId: string) => {
    const session = await getServerAuthSession();

    if (!canManageGames(session)) {
      throw new Error("Unauthorized");
    }

    const { data: result } = await getClient().mutate<ApproveGameMutation>({
      mutation: APPROVE_GAME,
      variables: { id: gameId },
    });

    if (result?.approveGame) {
      // We need the slug for revalidation, so we might need a better approve mutation or a query
      // For now, let's assume we can get it or just revalidate general paths
      revalidatePath("/");
      revalidatePath("/games");
    }

    return true;
  },
);

export const addLeague = createSafeAction(
  "addLeague",
  async (data: {
    gameId?: string;
    gameName?: string;
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
  }) => {
    const session = await getServerAuthSession();
    if (!session?.user?.id) throw new Error("Unauthorized");

    // If gameId is provided, we can try to revalidate specifically for that game
    let game = null;
    if (data.gameId) {
      game = await getGameRecord(data.gameId);
    }

    await getClient().mutate<CreateLeagueMutation>({
      mutation: CREATE_LEAGUE,
      variables: {
        input: {
          ...data,
          authorId: session.user.id,
        },
      },
    });

    if (game) {
      revalidateGamePaths(game);
    } else {
      revalidatePath("/");
      revalidatePath("/games");
    }

    return true;
  },
);

export const checkLeagueSlugAvailability = createSafeAction(
  "checkLeagueSlugAvailability",
  async (gameIdOrSlug: string, slug: string, currentLeagueId?: string) => {
    const normalizedSlug = slugify(slug);

    if (!gameIdOrSlug || !normalizedSlug) {
      return { available: true };
    }

    const game = await getGameRecord(gameIdOrSlug);

    if (!game) {
      return { available: true };
    }

    const conflict = game.leagues.some(
      (league) =>
        league.slug === normalizedSlug && league.id !== currentLeagueId,
    );

    return { available: !conflict };
  },
);

export const addPlayerToGame = createSafeAction(
  "addPlayerToGame",
  async (
    gameId: string,
    data: {
      username: string;
      userId: string | null;
    },
  ) => {
    const session = await getServerAuthSession();
    if (!canManagePlayers(session)) throw new Error("Unauthorized");

    const game = await getGameRecord(gameId);
    if (!game) throw new Error("Game not found");

    const { data: resultData } =
      await getClient().mutate<AddPlayerToGameMutation>({
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
    return { playerId: resultData?.addPlayerToGame.id };
  },
);

export const createAndAddPlayerToLeague = createSafeAction(
  "createAndAddPlayerToLeague",
  async (gameId: string, leagueId: string, username: string) => {
    const result = await addPlayerToGame(gameId, {
      username,
      userId: null,
    });

    if (result.success && result.data?.playerId) {
      const addResult = await addPlayerToLeague(leagueId, result.data.playerId);
      return addResult.data;
    }

    throw new Error(result.error || "Failed to add player to league");
  },
);

export const updateLeague = createSafeAction(
  "updateLeague",
  async (
    leagueId: string,
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
  ) => {
    const session = await getServerAuthSession();
    if (!canManageLeagues(session)) throw new Error("Unauthorized");

    await getClient().mutate<UpdateLeagueMutation>({
      mutation: UPDATE_LEAGUE,
      variables: { id: leagueId, input: data },
    });

    // Revalidate
    revalidatePath("/");
    return true;
  },
);

export const searchPlayersByGame = createSafeAction(
  "searchPlayersByGame",
  async (gameId: string, query: string) => {
    const session = await getServerAuthSession();
    if (!canManagePlayers(session)) throw new Error("Unauthorized");

    const { data } = await getClient().query<SearchPlayersQuery>({
      query: SEARCH_PLAYERS,
      variables: { gameId, query },
    });

    return (data?.searchPlayers.nodes || [])
      .filter((r) => !!r.player?.id)
      .map((r) => ({
        id: r.player!.id,
        username: r.username,
        country: r.player?.user?.country ?? null,
      }));
  },
);

export const addPlayerToLeague = createSafeAction(
  "addPlayerToLeague",
  async (leagueId: string, playerId: string, initialElo?: number) => {
    const session = await getServerAuthSession();
    if (!canManagePlayers(session)) throw new Error("Unauthorized");

    await getClient().mutate({
      mutation: ADD_PLAYER_TO_LEAGUE,
      variables: { leagueId, playerId, initialElo },
    });

    revalidatePath("/");
    return true;
  },
);

export const registerSelfToLeague = createSafeAction(
  "registerSelfToLeague",
  async (leagueId: string) => {
    const session = await getServerAuthSession();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await getClient().mutate<RegisterSelfToLeagueMutation>({
      mutation: REGISTER_SELF_TO_LEAGUE,
      variables: { leagueId },
    });

    revalidatePath("/");
    return true;
  },
);
