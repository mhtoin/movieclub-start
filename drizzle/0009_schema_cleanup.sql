-- Step 1: Drop dead columns
ALTER TABLE "movie" DROP COLUMN IF EXISTS "tierIds";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN IF EXISTS "shortlistId";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN IF EXISTS "accountId";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN IF EXISTS "sessionId";--> statement-breakpoint

-- Step 2: Add missing indexes
CREATE INDEX IF NOT EXISTS "review_movieId_idx" ON "review" USING btree ("movieId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "review_userId_idx" ON "review" USING btree ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tier_tierlistId_idx" ON "tier" USING btree ("tierlistId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "movies_on_tiers_tierId_idx" ON "movies_on_tiers" USING btree ("tierId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "recommended_movie_userId_idx" ON "recommended_movie" USING btree ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "session_userId_idx" ON "session" USING btree ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "_movie_to_shortlist_A_idx" ON "_movie_to_shortlist" USING btree ("A");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "_movie_to_raffle_A_idx" ON "_movie_to_raffle" USING btree ("A");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "movie_genres_idx" ON "movie" USING gin ("genres");--> statement-breakpoint

-- Step 3: Rename raffle.winningMovieID -> winningMovieId and add FK constraint
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='raffle' AND column_name='winningMovieID') THEN
    ALTER TABLE "raffle" RENAME COLUMN "winningMovieID" TO "winningMovieId";
  END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name='raffle_winningMovieId_movie_id_fk' AND table_name='raffle'
  ) THEN
    ALTER TABLE "raffle" ADD CONSTRAINT "raffle_winningMovieId_movie_id_fk" FOREIGN KEY ("winningMovieId") REFERENCES "public"."movie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;--> statement-breakpoint

-- Step 6: Add createdAt to key tables (defaults to NOW() for existing rows)
ALTER TABLE "movie" ADD COLUMN IF NOT EXISTS "createdAt" timestamp(3) NOT NULL DEFAULT NOW();--> statement-breakpoint
ALTER TABLE "review" ADD COLUMN IF NOT EXISTS "createdAt" timestamp(3) NOT NULL DEFAULT NOW();--> statement-breakpoint
ALTER TABLE "raffle" ADD COLUMN IF NOT EXISTS "createdAt" timestamp(3) NOT NULL DEFAULT NOW();--> statement-breakpoint
ALTER TABLE "tierlist" ADD COLUMN IF NOT EXISTS "createdAt" timestamp(3) NOT NULL DEFAULT NOW();--> statement-breakpoint
ALTER TABLE "recommended_movie" ADD COLUMN IF NOT EXISTS "createdAt" timestamp(3) NOT NULL DEFAULT NOW();--> statement-breakpoint

-- Step 7a: Enforce site_config as a singleton (at most one row)
CREATE UNIQUE INDEX IF NOT EXISTS "site_config_singleton" ON "site_config" ((TRUE));
