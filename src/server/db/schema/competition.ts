import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { users } from "@/server/db/schema/auth";

export const bracketTypeEnum = pgEnum("bracket_type", [
  "single_elimination",
  "double_elimination",
  "round_robin",
  "swiss",
]);

export const tournamentStatusEnum = pgEnum("tournament_status", [
  "draft",
  "published",
  "registration_open",
  "in_progress",
  "finished",
  "cancelled",
]);

export const participantStatusEnum = pgEnum("participant_status", [
  "registered",
  "checked_in",
  "eliminated",
  "withdrawn",
]);

export const games = pgTable(
  "games",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    platform: text("platform"),
    isActive: boolean("isActive").default(true).notNull(),
    createdAt: timestamp("createdAt", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updatedAt", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    gamesSlugIdx: uniqueIndex("games_slug_idx").on(table.slug),
  }),
);

export const tournaments = pgTable(
  "tournaments",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    gameId: text("gameId")
      .notNull()
      .references(() => games.id, { onDelete: "cascade" }),
    createdById: text("createdById")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    status: tournamentStatusEnum("status").default("draft").notNull(),
    bracketType: bracketTypeEnum("bracketType")
      .default("single_elimination")
      .notNull(),
    maxParticipants: integer("maxParticipants"),
    startsAt: timestamp("startsAt", {
      mode: "date",
      withTimezone: true,
    }),
    endsAt: timestamp("endsAt", {
      mode: "date",
      withTimezone: true,
    }),
    createdAt: timestamp("createdAt", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updatedAt", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    tournamentsSlugIdx: uniqueIndex("tournaments_slug_idx").on(table.slug),
    tournamentsGameIdx: index("tournaments_game_idx").on(table.gameId),
  }),
);

export const tournamentParticipants = pgTable(
  "tournamentParticipants",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    tournamentId: text("tournamentId")
      .notNull()
      .references(() => tournaments.id, { onDelete: "cascade" }),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    seed: integer("seed"),
    status: participantStatusEnum("status").default("registered").notNull(),
    joinedAt: timestamp("joinedAt", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    tournamentParticipantUniqueIdx: uniqueIndex(
      "tournament_participant_unique_idx",
    ).on(table.tournamentId, table.userId),
  }),
);

export const rankingEntries = pgTable(
  "rankingEntries",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    gameId: text("gameId")
      .notNull()
      .references(() => games.id, { onDelete: "cascade" }),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    rating: integer("rating").default(1000).notNull(),
    wins: integer("wins").default(0).notNull(),
    losses: integer("losses").default(0).notNull(),
    draws: integer("draws").default(0).notNull(),
    createdAt: timestamp("createdAt", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updatedAt", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    rankingUniqueIdx: uniqueIndex("ranking_unique_idx").on(table.gameId, table.userId),
    rankingGameIdx: index("ranking_game_idx").on(table.gameId),
  }),
);

export const gamesRelations = relations(games, ({ many }) => ({
  rankingEntries: many(rankingEntries),
  tournaments: many(tournaments),
}));

export const tournamentsRelations = relations(tournaments, ({ one, many }) => ({
  game: one(games, {
    fields: [tournaments.gameId],
    references: [games.id],
  }),
  createdBy: one(users, {
    fields: [tournaments.createdById],
    references: [users.id],
  }),
  participants: many(tournamentParticipants),
}));

export const tournamentParticipantsRelations = relations(
  tournamentParticipants,
  ({ one }) => ({
    tournament: one(tournaments, {
      fields: [tournamentParticipants.tournamentId],
      references: [tournaments.id],
    }),
    user: one(users, {
      fields: [tournamentParticipants.userId],
      references: [users.id],
    }),
  }),
);

export const rankingEntriesRelations = relations(rankingEntries, ({ one }) => ({
  game: one(games, {
    fields: [rankingEntries.gameId],
    references: [games.id],
  }),
  user: one(users, {
    fields: [rankingEntries.userId],
    references: [users.id],
  }),
}));
