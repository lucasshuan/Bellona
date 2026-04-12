import { relations } from "drizzle-orm";
import {
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { users } from "@/server/db/schema/auth";
import { primaryId, timestamps } from "@/server/db/schema/shared";

export const INITIAL_PERMISSION_DEFINITIONS = [
  { key: "register_player", name: "Register Player" },
  { key: "edit_player", name: "Edit Player" },
  { key: "post_result", name: "Post Result" },
  { key: "edit_result", name: "Edit Result" },
  { key: "delete_result", name: "Delete Result" },
  { key: "register_game", name: "Register Game" },
  { key: "edit_game", name: "Edit Game" },
  { key: "create_ranking", name: "Create Ranking" },
  { key: "edit_ranking", name: "Edit Ranking" },
] as const;

export type PermissionKey =
  (typeof INITIAL_PERMISSION_DEFINITIONS)[number]["key"];

export const resultAttachmentTypeEnum = pgEnum("result_attachment_type", [
  "image",
  "video",
]);

export const videoPlatformEnum = pgEnum("video_platform", [
  "twitch",
  "youtube",
  "other",
]);

export const games = pgTable(
  "games",
  {
    ...primaryId,
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    backgroundImageUrl: text("background_image_url"),
    thumbnailImageUrl: text("thumbnail_image_url"),
    steamUrl: text("steam_url"),
    ...timestamps,
  },
  (table) => ({
    gamesNameIdx: uniqueIndex("games_name_idx").on(table.name),
  }),
);

export const players = pgTable(
  "players",
  {
    ...primaryId,
    gameId: text("game_id")
      .notNull()
      .references(() => games.id, { onDelete: "cascade" }),
    userId: text("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    country: text("country"),
    primaryUsernameId: text("primary_username_id"),
    ...timestamps,
  },
  (table) => ({
    playersGameIdIdx: index("players_game_id_idx").on(table.gameId),
    playersUserIdIdx: index("players_user_id_idx").on(table.userId),
    playersGameUserIdx: uniqueIndex("players_game_user_idx").on(
      table.gameId,
      table.userId,
    ),
    playersPrimaryUsernameIdIdx: index("players_primary_username_id_idx").on(
      table.primaryUsernameId,
    ),
  }),
);

export const playerUsernames = pgTable(
  "player_usernames",
  {
    ...primaryId,
    playerId: text("player_id")
      .notNull()
      .references(() => players.id, { onDelete: "cascade" }),
    username: text("username").notNull(),
    ...timestamps,
  },
  (table) => ({
    playerUsernamesPlayerUsernameIdx: uniqueIndex(
      "player_usernames_player_username_idx",
    ).on(table.playerId, table.username),
    playerUsernamesPlayerIdIdx: index("player_usernames_player_id_idx").on(
      table.playerId,
    ),
  }),
);

export const rankings = pgTable(
  "rankings",
  {
    ...primaryId,
    gameId: text("game_id")
      .notNull()
      .references(() => games.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    ...timestamps,
  },
  (table) => ({
    rankingsGameNameIdx: uniqueIndex("rankings_game_name_idx").on(
      table.gameId,
      table.name,
    ),
    rankingsGameIdIdx: index("rankings_game_id_idx").on(table.gameId),
  }),
);

export const rankingEntries = pgTable(
  "ranking_entries",
  {
    ...primaryId,
    rankingId: text("ranking_id")
      .notNull()
      .references(() => rankings.id, { onDelete: "cascade" }),
    playerId: text("player_id")
      .notNull()
      .references(() => players.id, { onDelete: "cascade" }),
    currentElo: integer("current_elo").default(1000).notNull(),
    ...timestamps,
  },
  (table) => ({
    rankingEntriesRankingPlayerIdx: uniqueIndex(
      "ranking_entries_ranking_player_idx",
    ).on(table.rankingId, table.playerId),
    rankingEntriesRankingIdIdx: index("ranking_entries_ranking_id_idx").on(
      table.rankingId,
    ),
    rankingEntriesPlayerIdIdx: index("ranking_entries_player_id_idx").on(
      table.playerId,
    ),
  }),
);

export const results = pgTable(
  "results",
  {
    ...primaryId,
    rankingId: text("ranking_id")
      .notNull()
      .references(() => rankings.id, { onDelete: "cascade" }),
    description: text("description"),
    ...timestamps,
  },
  (table) => ({
    resultsRankingIdIdx: index("results_ranking_id_idx").on(table.rankingId),
  }),
);

export const resultEntries = pgTable(
  "result_entries",
  {
    ...primaryId,
    resultId: text("result_id")
      .notNull()
      .references(() => results.id, { onDelete: "cascade" }),
    playerId: text("player_id")
      .notNull()
      .references(() => players.id, { onDelete: "cascade" }),
    eloDifference: integer("elo_difference").notNull(),
    ...timestamps,
  },
  (table) => ({
    resultEntriesResultPlayerIdx: uniqueIndex(
      "result_entries_result_player_idx",
    ).on(table.resultId, table.playerId),
    resultEntriesResultIdIdx: index("result_entries_result_id_idx").on(
      table.resultId,
    ),
    resultEntriesPlayerIdIdx: index("result_entries_player_id_idx").on(
      table.playerId,
    ),
  }),
);

export const resultAttachments = pgTable(
  "result_attachments",
  {
    ...primaryId,
    resultId: text("result_id")
      .notNull()
      .references(() => results.id, { onDelete: "cascade" }),
    type: resultAttachmentTypeEnum("type").notNull(),
    videoPlatform: videoPlatformEnum("video_platform"),
    url: text("url").notNull(),
    ...timestamps,
  },
  (table) => ({
    resultAttachmentsResultIdIdx: index("result_attachments_result_id_idx").on(
      table.resultId,
    ),
    resultAttachmentsTypeIdx: index("result_attachments_type_idx").on(
      table.type,
    ),
  }),
);

export const permissions = pgTable(
  "permissions",
  {
    ...primaryId,
    gameId: text("game_id")
      .notNull()
      .references(() => games.id, { onDelete: "cascade" }),
    key: text("key").$type<PermissionKey>().notNull(),
    name: text("name").notNull(),
    ...timestamps,
  },
  (table) => ({
    permissionsGameKeyIdx: uniqueIndex("permissions_game_key_idx").on(
      table.gameId,
      table.key,
    ),
    permissionsGameIdIdx: index("permissions_game_id_idx").on(table.gameId),
  }),
);

export const userPermissions = pgTable(
  "user_permissions",
  {
    ...primaryId,
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    permissionId: text("permission_id")
      .notNull()
      .references(() => permissions.id, { onDelete: "cascade" }),
    ...timestamps,
  },
  (table) => ({
    userPermissionsUserPermissionIdx: uniqueIndex(
      "user_permissions_user_permission_idx",
    ).on(table.userId, table.permissionId),
    userPermissionsUserIdIdx: index("user_permissions_user_id_idx").on(
      table.userId,
    ),
    userPermissionsPermissionIdIdx: index(
      "user_permissions_permission_id_idx",
    ).on(table.permissionId),
  }),
);

export const gamesRelations = relations(games, ({ many }) => ({
  players: many(players),
  rankings: many(rankings),
  permissions: many(permissions),
}));

export const playersRelations = relations(players, ({ one, many }) => ({
  game: one(games, {
    fields: [players.gameId],
    references: [games.id],
  }),
  user: one(users, {
    fields: [players.userId],
    references: [users.id],
  }),
  usernames: many(playerUsernames),
  rankingEntries: many(rankingEntries),
  resultEntries: many(resultEntries),
}));

export const playerUsernamesRelations = relations(
  playerUsernames,
  ({ one }) => ({
    player: one(players, {
      fields: [playerUsernames.playerId],
      references: [players.id],
    }),
  }),
);

export const rankingsRelations = relations(rankings, ({ one, many }) => ({
  game: one(games, {
    fields: [rankings.gameId],
    references: [games.id],
  }),
  entries: many(rankingEntries),
  results: many(results),
}));

export const rankingEntriesRelations = relations(rankingEntries, ({ one }) => ({
  ranking: one(rankings, {
    fields: [rankingEntries.rankingId],
    references: [rankings.id],
  }),
  player: one(players, {
    fields: [rankingEntries.playerId],
    references: [players.id],
  }),
}));

export const resultsRelations = relations(results, ({ one, many }) => ({
  ranking: one(rankings, {
    fields: [results.rankingId],
    references: [rankings.id],
  }),
  entries: many(resultEntries),
  attachments: many(resultAttachments),
}));

export const resultEntriesRelations = relations(resultEntries, ({ one }) => ({
  result: one(results, {
    fields: [resultEntries.resultId],
    references: [results.id],
  }),
  player: one(players, {
    fields: [resultEntries.playerId],
    references: [players.id],
  }),
}));

export const resultAttachmentsRelations = relations(
  resultAttachments,
  ({ one }) => ({
    result: one(results, {
      fields: [resultAttachments.resultId],
      references: [results.id],
    }),
  }),
);

export const permissionsRelations = relations(permissions, ({ one, many }) => ({
  game: one(games, {
    fields: [permissions.gameId],
    references: [games.id],
  }),
  userPermissions: many(userPermissions),
}));

export const userPermissionsRelations = relations(
  userPermissions,
  ({ one }) => ({
    user: one(users, {
      fields: [userPermissions.userId],
      references: [users.id],
    }),
    permission: one(permissions, {
      fields: [userPermissions.permissionId],
      references: [permissions.id],
    }),
  }),
);

export type Game = typeof games.$inferSelect;
export type NewGame = typeof games.$inferInsert;
export type Player = typeof players.$inferSelect;
export type NewPlayer = typeof players.$inferInsert;
export type PlayerUsername = typeof playerUsernames.$inferSelect;
export type NewPlayerUsername = typeof playerUsernames.$inferInsert;
export type Ranking = typeof rankings.$inferSelect;
export type NewRanking = typeof rankings.$inferInsert;
export type RankingEntry = typeof rankingEntries.$inferSelect;
export type NewRankingEntry = typeof rankingEntries.$inferInsert;
export type Result = typeof results.$inferSelect;
export type NewResult = typeof results.$inferInsert;
export type ResultEntry = typeof resultEntries.$inferSelect;
export type NewResultEntry = typeof resultEntries.$inferInsert;
export type ResultAttachment = typeof resultAttachments.$inferSelect;
export type NewResultAttachment = typeof resultAttachments.$inferInsert;
export type Permission = typeof permissions.$inferSelect;
export type NewPermission = typeof permissions.$inferInsert;
export type UserPermission = typeof userPermissions.$inferSelect;
export type NewUserPermission = typeof userPermissions.$inferInsert;
