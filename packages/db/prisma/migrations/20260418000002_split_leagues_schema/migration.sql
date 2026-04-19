-- Migration: Split unified `leagues` into `elo_leagues` + `standard_leagues`
-- and restructure related result/entry tables to match the new schema.
-- Existing data is preserved by copying rows before dropping old tables.
-- This migration is written to be idempotent (safe to re-run after partial failures).

-- ─── 1. ENUMS ──────────────────────────────────────────────────────────────

-- New enum used by StandardResultEntry (no-op if already exists)
DO $$ BEGIN
  CREATE TYPE "MatchOutcome" AS ENUM ('WIN', 'DRAW', 'LOSS');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Rename the old LEAGUE value → RANKED_LEAGUE only if it still exists.
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'EventType' AND e.enumlabel = 'LEAGUE'
  ) THEN
    ALTER TYPE "EventType" RENAME VALUE 'LEAGUE' TO 'RANKED_LEAGUE';
  END IF;
END $$;

-- Add the new STANDARD_LEAGUE value (no-op if already exists)
ALTER TYPE "EventType" ADD VALUE IF NOT EXISTS 'STANDARD_LEAGUE';

-- ─── 2. ELO_LEAGUES (from leagues) ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "elo_leagues" (
    "event_id"                   TEXT NOT NULL,
    "initial_elo"                INTEGER NOT NULL DEFAULT 1000,
    "allow_draw"                 BOOLEAN NOT NULL DEFAULT false,
    "k_factor"                   INTEGER NOT NULL DEFAULT 20,
    "score_relevance"            DOUBLE PRECISION NOT NULL DEFAULT 0.4,
    "inactivity_decay"           INTEGER NOT NULL DEFAULT 5,
    "inactivity_threshold_hours" INTEGER NOT NULL DEFAULT 120,
    "inactivity_decay_floor"     INTEGER NOT NULL DEFAULT 1000,
    "allowed_formats"            "MatchFormat"[] NOT NULL DEFAULT ARRAY[]::"MatchFormat"[],
    CONSTRAINT "elo_leagues_pkey" PRIMARY KEY ("event_id")
);

INSERT INTO "elo_leagues" (
    "event_id", "initial_elo", "allow_draw", "k_factor",
    "score_relevance", "inactivity_decay", "inactivity_threshold_hours",
    "inactivity_decay_floor", "allowed_formats"
)
SELECT
    l."event_id", l."initial_elo", l."allow_draw", l."k_factor",
    l."score_relevance", l."inactivity_decay", l."inactivity_threshold_hours",
    l."inactivity_decay_floor", l."allowed_formats"
FROM "leagues" l
WHERE NOT EXISTS (SELECT 1 FROM "elo_leagues" el WHERE el."event_id" = l."event_id");

DO $$ BEGIN
  ALTER TABLE "elo_leagues"
    ADD CONSTRAINT "elo_leagues_event_id_fkey"
    FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── 3. STANDARD_LEAGUES (new) ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "standard_leagues" (
    "event_id"        TEXT NOT NULL,
    "allow_draw"      BOOLEAN NOT NULL DEFAULT false,
    "points_per_win"  INTEGER NOT NULL DEFAULT 3,
    "points_per_draw" INTEGER NOT NULL DEFAULT 1,
    "points_per_loss" INTEGER NOT NULL DEFAULT 0,
    "allowed_formats" "MatchFormat"[] NOT NULL DEFAULT ARRAY[]::"MatchFormat"[],
    CONSTRAINT "standard_leagues_pkey" PRIMARY KEY ("event_id")
);

DO $$ BEGIN
  ALTER TABLE "standard_leagues"
    ADD CONSTRAINT "standard_leagues_event_id_fkey"
    FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── 4. ELO_LEAGUE_ENTRIES (from league_entries) ───────────────────────────

CREATE TABLE IF NOT EXISTS "elo_league_entries" (
    "id"          TEXT NOT NULL,
    "event_id"    TEXT NOT NULL,
    "player_id"   TEXT NOT NULL,
    "current_elo" INTEGER NOT NULL DEFAULT 1000,
    "created_at"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"  TIMESTAMP(3) NOT NULL,
    CONSTRAINT "elo_league_entries_pkey" PRIMARY KEY ("id")
);

INSERT INTO "elo_league_entries"
SELECT le.*
FROM "league_entries" le
WHERE NOT EXISTS (SELECT 1 FROM "elo_league_entries" ele WHERE ele."id" = le."id");

CREATE UNIQUE INDEX IF NOT EXISTS "elo_league_entries_event_id_player_id_key"
    ON "elo_league_entries"("event_id", "player_id");

DO $$ BEGIN
  ALTER TABLE "elo_league_entries"
    ADD CONSTRAINT "elo_league_entries_event_id_fkey"
    FOREIGN KEY ("event_id") REFERENCES "elo_leagues"("event_id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "elo_league_entries"
    ADD CONSTRAINT "elo_league_entries_player_id_fkey"
    FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── 5. STANDARD_LEAGUE_ENTRIES (new) ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS "standard_league_entries" (
    "id"         TEXT NOT NULL,
    "event_id"   TEXT NOT NULL,
    "player_id"  TEXT NOT NULL,
    "points"     INTEGER NOT NULL DEFAULT 0,
    "wins"       INTEGER NOT NULL DEFAULT 0,
    "draws"      INTEGER NOT NULL DEFAULT 0,
    "losses"     INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "standard_league_entries_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "standard_league_entries_event_id_player_id_key"
    ON "standard_league_entries"("event_id", "player_id");

DO $$ BEGIN
  ALTER TABLE "standard_league_entries"
    ADD CONSTRAINT "standard_league_entries_event_id_fkey"
    FOREIGN KEY ("event_id") REFERENCES "standard_leagues"("event_id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "standard_league_entries"
    ADD CONSTRAINT "standard_league_entries_player_id_fkey"
    FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── 6. ELO_RESULTS (from results) ─────────────────────────────────────────
-- NOTE: results.format was added by ALTER TABLE so it is the last column;
--       explicit column list avoids position mismatch.

CREATE TABLE IF NOT EXISTS "elo_results" (
    "id"          TEXT NOT NULL,
    "event_id"    TEXT NOT NULL,
    "description" TEXT,
    "format"      "MatchFormat" NOT NULL,
    "created_at"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"  TIMESTAMP(3) NOT NULL,
    CONSTRAINT "elo_results_pkey" PRIMARY KEY ("id")
);

INSERT INTO "elo_results" ("id", "event_id", "description", "format", "created_at", "updated_at")
SELECT r."id", r."event_id", r."description", r."format", r."created_at", r."updated_at"
FROM "results" r
WHERE NOT EXISTS (SELECT 1 FROM "elo_results" er WHERE er."id" = r."id");

DO $$ BEGIN
  ALTER TABLE "elo_results"
    ADD CONSTRAINT "elo_results_event_id_fkey"
    FOREIGN KEY ("event_id") REFERENCES "elo_leagues"("event_id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── 7. ELO_RESULT_ENTRIES (from result_entries) ───────────────────────────

CREATE TABLE IF NOT EXISTS "elo_result_entries" (
    "id"             TEXT NOT NULL,
    "result_id"      TEXT NOT NULL,
    "player_id"      TEXT NOT NULL,
    "elo_difference" INTEGER NOT NULL,
    "created_at"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"     TIMESTAMP(3) NOT NULL,
    CONSTRAINT "elo_result_entries_pkey" PRIMARY KEY ("id")
);

INSERT INTO "elo_result_entries"
SELECT re.*
FROM "result_entries" re
WHERE NOT EXISTS (SELECT 1 FROM "elo_result_entries" ere WHERE ere."id" = re."id");

CREATE UNIQUE INDEX IF NOT EXISTS "elo_result_entries_result_id_player_id_key"
    ON "elo_result_entries"("result_id", "player_id");

DO $$ BEGIN
  ALTER TABLE "elo_result_entries"
    ADD CONSTRAINT "elo_result_entries_result_id_fkey"
    FOREIGN KEY ("result_id") REFERENCES "elo_results"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "elo_result_entries"
    ADD CONSTRAINT "elo_result_entries_player_id_fkey"
    FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── 8. ELO_RESULT_ATTACHMENTS (from result_attachments) ───────────────────

CREATE TABLE IF NOT EXISTS "elo_result_attachments" (
    "id"             TEXT NOT NULL,
    "result_id"      TEXT NOT NULL,
    "type"           "ResultAttachmentType" NOT NULL,
    "video_platform" "VideoPlatform",
    "url"            TEXT NOT NULL,
    "created_at"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"     TIMESTAMP(3) NOT NULL,
    CONSTRAINT "elo_result_attachments_pkey" PRIMARY KEY ("id")
);

INSERT INTO "elo_result_attachments"
SELECT ra.*
FROM "result_attachments" ra
WHERE NOT EXISTS (SELECT 1 FROM "elo_result_attachments" era WHERE era."id" = ra."id");

DO $$ BEGIN
  ALTER TABLE "elo_result_attachments"
    ADD CONSTRAINT "elo_result_attachments_result_id_fkey"
    FOREIGN KEY ("result_id") REFERENCES "elo_results"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── 9. STANDARD_RESULTS (new) ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "standard_results" (
    "id"          TEXT NOT NULL,
    "event_id"    TEXT NOT NULL,
    "description" TEXT,
    "format"      "MatchFormat" NOT NULL,
    "created_at"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"  TIMESTAMP(3) NOT NULL,
    CONSTRAINT "standard_results_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  ALTER TABLE "standard_results"
    ADD CONSTRAINT "standard_results_event_id_fkey"
    FOREIGN KEY ("event_id") REFERENCES "standard_leagues"("event_id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── 10. STANDARD_RESULT_ENTRIES (new) ─────────────────────────────────────

CREATE TABLE IF NOT EXISTS "standard_result_entries" (
    "id"            TEXT NOT NULL,
    "result_id"     TEXT NOT NULL,
    "player_id"     TEXT NOT NULL,
    "outcome"       "MatchOutcome" NOT NULL,
    "score"         INTEGER NOT NULL,
    "points_gained" INTEGER NOT NULL,
    "created_at"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"    TIMESTAMP(3) NOT NULL,
    CONSTRAINT "standard_result_entries_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "standard_result_entries_result_id_player_id_key"
    ON "standard_result_entries"("result_id", "player_id");

DO $$ BEGIN
  ALTER TABLE "standard_result_entries"
    ADD CONSTRAINT "standard_result_entries_result_id_fkey"
    FOREIGN KEY ("result_id") REFERENCES "standard_results"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "standard_result_entries"
    ADD CONSTRAINT "standard_result_entries_player_id_fkey"
    FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── 11. STANDARD_RESULT_ATTACHMENTS (new) ─────────────────────────────────

CREATE TABLE IF NOT EXISTS "standard_result_attachments" (
    "id"             TEXT NOT NULL,
    "result_id"      TEXT NOT NULL,
    "type"           "ResultAttachmentType" NOT NULL,
    "video_platform" "VideoPlatform",
    "url"            TEXT NOT NULL,
    "created_at"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"     TIMESTAMP(3) NOT NULL,
    CONSTRAINT "standard_result_attachments_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  ALTER TABLE "standard_result_attachments"
    ADD CONSTRAINT "standard_result_attachments_result_id_fkey"
    FOREIGN KEY ("result_id") REFERENCES "standard_results"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── 12. DROP LEGACY TABLES ─────────────────────────────────────────────────

DROP TABLE IF EXISTS "result_attachments" CASCADE;
DROP TABLE IF EXISTS "result_entries" CASCADE;
DROP TABLE IF EXISTS "results" CASCADE;
DROP TABLE IF EXISTS "league_entries" CASCADE;
DROP TABLE IF EXISTS "leagues" CASCADE;
