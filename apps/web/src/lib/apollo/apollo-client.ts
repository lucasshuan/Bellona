import { HttpLink, from } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import {
  registerApolloClient,
  ApolloClient,
  InMemoryCache,
} from "@apollo/client-integration-nextjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth/config";
import { env } from "@/env";

export const { getClient, query, PreloadQuery } = registerApolloClient(() => {
  const httpLink = new HttpLink({
    uri: env.NEXT_PUBLIC_API_URL,
  });

  const authLink = setContext(async (_, { headers }) => {
    const session = await getServerSession(authOptions);
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
});
