import "server-only";

import type { NextAuthOptions, User as NextAuthUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { env } from "@/env";

type BackendJwtPayload = {
  sub: string;
  username: string;
  isAdmin: boolean;
  permissions?: string[];
};

export const authOptions = {
  secret: env.NEXTAUTH_SECRET,
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

          const payload = JSON.parse(jsonPayload) as BackendJwtPayload;

          return {
            id: payload.sub,
            username: payload.username,
            name: payload.username,
            isAdmin: payload.isAdmin || false,
            permissions: payload.permissions || [],
            accessToken: credentials.token,
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
        token.permissions = user.permissions ?? [];
        if (user.accessToken) {
          token.accessToken = user.accessToken;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.username = token.username;
        session.user.isAdmin = token.isAdmin;
        session.user.accessToken = token.accessToken;
        session.user.permissions = token.permissions ?? [];
      }

      return session;
    },
  },
} satisfies NextAuthOptions;
