import "server-only";

import { PrismaAdapter } from "@auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import type { Adapter } from "next-auth/adapters";
import DiscordProvider, {
  type DiscordProfile,
} from "next-auth/providers/discord";

import { env } from "@/env";
import { prisma as db, type PermissionKey } from "@ares/db";
import { generateUniqueUsername } from "@/server/utils/user";

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
      profile: async (profile: DiscordProfile) => {
        const username = await generateUniqueUsername(profile.username);
        const avatarUrl = profile.avatar
          ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.${profile.avatar.startsWith("a_") ? "gif" : "png"}`
          : `https://cdn.discordapp.com/embed/avatars/${parseInt(profile.discriminator || "0") % 5}.png`;

        return {
          id: profile.id,
          name: profile.global_name ?? profile.username,
          email: profile.email,
          image: avatarUrl,
          username,
          isAdmin: false,
        };
      },
    }),
  );
}

export const authOptions = {
  secret: env.AUTH_SECRET,
  session: {
    strategy: "database",
  },
  adapter: PrismaAdapter(db) as Adapter,
  pages: {
    error: "/?error=Callback",
  },
  providers,
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        const dbUser = await db.user.findUnique({
          where: { id: user.id },
          include: {
            userPermissions: {
              include: {
                permission: true,
              },
            },
          },
        });

        if (dbUser) {
          session.user.id = dbUser.id;
          session.user.username = dbUser.username;
          session.user.name = dbUser.name;
          session.user.bio = dbUser.bio ?? null;
          session.user.profileColor = dbUser.profileColor ?? null;
          session.user.isAdmin = dbUser.isAdmin;
          session.user.permissions = dbUser.userPermissions.map((up) => ({
            id: up.permission.id,
            key: up.permission.key as PermissionKey,
            name: up.permission.name,
          }));
        }
      }

      return session;
    },
  },
} satisfies NextAuthOptions;
