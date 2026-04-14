import "server-only";

import type { NextAuthOptions, User as NextAuthUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { env } from "@/env";

export const hasDiscordAuth =
  !!env.AUTH_DISCORD_ID && !!env.AUTH_DISCORD_SECRET;

export const authOptions = {
  secret: env.AUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    error: "/?error=Callback",
    signIn: "/auth/signin",
  },
  providers: [
    CredentialsProvider({
      name: "Backend Token",
      credentials: {
        token: { label: "Token", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.token) return null;
        try {
          // Parse JWT payload from backend
          const base64Url = credentials.token.split(".")[1];
          const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split("")
              .map(function (c) {
                return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
              })
              .join(""),
          );

          const payload = JSON.parse(jsonPayload);

          return {
            id: payload.sub as string,
            username: payload.username as string,
            name: payload.name || payload.username,
            isAdmin: payload.isAdmin || false,
            // the rest can be fetched via graphql if necessary
          } as NextAuthUser;
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.isAdmin = user.isAdmin;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.isAdmin = token.isAdmin as boolean;
        // initialize empty/default so it compiles
        session.user.permissions = [];
      }
      return session;
    },
  },
} satisfies NextAuthOptions;
