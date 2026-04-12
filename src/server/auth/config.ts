import "server-only";

import { DrizzleAdapter } from "@auth/drizzle-adapter";
import type { NextAuthOptions } from "next-auth";
import type { Adapter } from "next-auth/adapters";
import DiscordProvider from "next-auth/providers/discord";

import { env } from "@/env";
import { db } from "@/server/db";
import {
  accounts,
  sessions,
  users,
  verificationTokens,
} from "@/server/db/schema";

export const hasDiscordAuth =
  !!env.AUTH_DISCORD_ID && !!env.AUTH_DISCORD_SECRET;

const providers: NextAuthOptions["providers"] = [];

if (hasDiscordAuth) {
  const clientId = env.AUTH_DISCORD_ID!;
  const clientSecret = env.AUTH_DISCORD_SECRET!;

  providers.push(
    DiscordProvider({
      clientId,
      clientSecret,
    }),
  );
}

export const authOptions = {
  secret: env.AUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "database",
  },
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }) as Adapter,
  providers,
  callbacks: {
    session({ session, user }) {
      const dbUser = user as typeof user & {
        role?: "player" | "admin";
        username?: string | null;
      };

      if (session.user) {
        session.user.id = user.id;
        session.user.role = dbUser.role ?? "player";
        session.user.username = dbUser.username ?? null;
      }

      return session;
    },
  },
} satisfies NextAuthOptions;
