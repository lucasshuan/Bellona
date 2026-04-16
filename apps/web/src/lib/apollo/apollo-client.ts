import { HttpLink, ApolloLink } from "@apollo/client";
import { SetContextLink } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import { CombinedGraphQLErrors } from "@apollo/client/errors";
import {
  registerApolloClient,
  ApolloClient,
  InMemoryCache,
} from "@apollo/client-integration-nextjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth/config";
import { env } from "@/env";
import { logger } from "@/lib/logger";

export const { getClient, query, PreloadQuery } = registerApolloClient(() => {
  const httpLink = new HttpLink({
    uri: env.NEXT_PUBLIC_API_URL,
  });

  const authLink = new SetContextLink(async ({ headers }) => {
    const session = await getServerSession(authOptions);
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
        logger.error(
          { operation: operation.operationName, path, locations },
          `[GraphQL error]: Message: ${message}`,
        );
      });
    } else {
      logger.error(
        { operation: operation.operationName, error },
        `[Network error]: ${error.message}`,
      );
    }
  });

  return new ApolloClient({
    cache: new InMemoryCache(),
    link: ApolloLink.from([errorLink, authLink, httpLink]),
    devtools: {
      enabled: true,
    },
  });
});
