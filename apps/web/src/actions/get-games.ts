"use server";

import { getClient } from "@/lib/apollo/apollo-client";
import { GET_GAMES_SIMPLE } from "@/lib/apollo/queries/games";
import { GetGamesSimpleQuery } from "@/lib/apollo/generated/graphql";

import { createSafeAction } from "@/lib/action-utils";

export type SimpleGame = GetGamesSimpleQuery["games"]["nodes"][number];

export const getGamesSimple = createSafeAction(
  "getGamesSimple",
  async (search?: string): Promise<SimpleGame[]> => {
    const { data } = await getClient().query<GetGamesSimpleQuery>({
      query: GET_GAMES_SIMPLE,
      variables: {
        search,
        pagination: { take: 50 },
      },
      fetchPolicy: "network-only",
    });

    if (!data?.games) {
      return [];
    }

    return data.games.nodes;
  },
);
