"use client";

import { HttpLink, ApolloLink } from "@apollo/client";
import { SetContextLink } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import { CombinedGraphQLErrors } from "@apollo/client/errors";
import {
  ApolloNextAppProvider,
  ApolloClient,
  InMemoryCache,
} from "@apollo/client-integration-nextjs";
import { getSession, signOut } from "next-auth/react";
import { env } from "@/env";

function makeClient() {
  const httpLink = new HttpLink({
    uri: env.NEXT_PUBLIC_API_URL,
    fetchOptions: { cache: "no-store" },
  });

  const authLink = new SetContextLink(async ({ headers }) => {
    const session = await getSession();
    const token = session?.user?.accessToken;

    return {
      headers: {
        ...headers,
        Authorization: token ? `Bearer ${token}` : "",
      },
    };
  });

  const errorLink = onError(({ error, operation }) => {
    if (CombinedGraphQLErrors.is(error)) {
      error.errors.forEach(({ message, locations, path }) => {
        console.error(
          `[GraphQL error] op=${operation.operationName} path=${String(path)} message=${message}`,
          { locations },
        );
      });

      if (
        error.errors.some((e) => e.extensions?.["code"] === "UNAUTHENTICATED")
      ) {
        void signOut({ callbackUrl: "/" });
      }
    } else if (error) {
      console.error(
        `[Network error] op=${operation.operationName}: ${error.message}`,
      );

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const statusCode = (error as any).statusCode as number | undefined;
      if (statusCode === 401 || statusCode === 403) {
        void signOut({ callbackUrl: "/" });
      }
    }
  });

  const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: ApolloLink.from([errorLink, authLink, httpLink]),
    devtools: {
      enabled: true,
    },
  });

  return client;
}

export function ApolloWrapper({ children }: React.PropsWithChildren) {
  return (
    <ApolloNextAppProvider makeClient={makeClient}>
      {children}
    </ApolloNextAppProvider>
  );
}
