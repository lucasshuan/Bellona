"use server";

import { getServerAuthSession } from "@/auth";
import { getClient } from "@/lib/apollo/apollo-client";
import { SEARCH_USERS } from "@/lib/apollo/queries/user";
import { SearchUsersQuery } from "@/lib/apollo/generated/graphql";

import { createSafeAction } from "@/lib/action-utils";

export const searchUsers = createSafeAction(
  "searchUsers",
  async (query: string) => {
    const session = await getServerAuthSession();
    if (!session?.user) return [];

    const { data } = await getClient().query<SearchUsersQuery>({
      query: SEARCH_USERS,
      variables: { query, pagination: { skip: 0, take: 10 } },
    });

    return data?.searchUsers?.nodes || [];
  },
);
