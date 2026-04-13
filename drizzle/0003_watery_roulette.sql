ALTER TABLE "permissions" DROP CONSTRAINT "permissions_game_id_games_id_fk";
--> statement-breakpoint
DROP INDEX "permissions_game_key_idx";--> statement-breakpoint
DROP INDEX "permissions_game_id_idx";--> statement-breakpoint
CREATE UNIQUE INDEX "permissions_key_idx" ON "permissions" USING btree ("key");--> statement-breakpoint
ALTER TABLE "permissions" DROP COLUMN "game_id";--> statement-breakpoint
ALTER TABLE "permissions" ADD CONSTRAINT "permissions_key_unique" UNIQUE("key");