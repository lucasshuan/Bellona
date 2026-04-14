"use client";

import { HttpLink, from } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import {
  ApolloNextAppProvider,
  ApolloClient,
  InMemoryCache,
} from "@apollo/client-integration-nextjs";
import { getSession } from "next-auth/react";
import { env } from "@/env";

function makeClient() {
  const httpLink = new HttpLink({
    uri: env.NEXT_PUBLIC_API_URL,
    fetchOptions: { cache: "no-store" },
  });

  const authLink = setContext(async (_, { headers }) => {
    const session = await getSession();
    const token = session?.user?.accessToken;

    return {
      headers: {
        ...headers,
        Authorization: token ? `Bearer ${token}` : "",
      },
    };
  });

  return new ApolloClient({
    cache: new InMemoryCache(),
    link: from([authLink, httpLink]),
  });
}

export function ApolloWrapper({ children }: React.PropsWithChildren) {
  return (
    <ApolloNextAppProvider makeClient={makeClient}>
      {children}
    </ApolloNextAppProvider>
  );
}
