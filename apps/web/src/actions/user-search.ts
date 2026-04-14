"use server";

import { getServerAuthSession } from "@/auth";
import { getClient } from "@/lib/apollo/apollo-client";
import { SEARCH_USERS } from "@/lib/apollo/queries/user";
import { User } from "@/lib/apollo/types";

export async function searchUsers(query: string) {
  const session = await getServerAuthSession();
  if (!session?.user) return [];

  const { data } = await getClient().query<{ searchUsers: { nodes: User[] } }>({
    query: SEARCH_USERS,
    variables: { query, pagination: { skip: 0, take: 10 } },
  });

  return data?.searchUsers?.nodes || [];
}
