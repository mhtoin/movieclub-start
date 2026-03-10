CREATE TABLE IF NOT EXISTS "movie_credits" (
	"id" text PRIMARY KEY NOT NULL,
	"cast" jsonb DEFAULT 'null'::jsonb,
	"crew" jsonb DEFAULT 'null'::jsonb
);
--> statement-breakpoint
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='raffle' AND column_name='winningMovieID') THEN
    ALTER TABLE "raffle" RENAME COLUMN "winningMovieID" TO "winningMovieId";
  END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='raffle' AND column_name='date') THEN
    ALTER TABLE "raffle" RENAME COLUMN "date" TO "raffledAt";
  END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name='RecommendedMovie_movieId_fkey' AND table_name='recommended_movie'
  ) THEN
    ALTER TABLE "recommended_movie" DROP CONSTRAINT "RecommendedMovie_movieId_fkey";
  END IF;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  IF (SELECT data_type FROM information_schema.columns WHERE table_name='movie' AND column_name='release_date') <> 'date' THEN
    ALTER TABLE "movie" ALTER COLUMN "release_date" DROP NOT NULL;
    ALTER TABLE "movie" ALTER COLUMN "release_date" SET DATA TYPE date USING NULLIF("release_date"::text, '')::date;
  END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF (SELECT data_type FROM information_schema.columns WHERE table_name='movie' AND column_name='watchDate') NOT IN ('timestamp without time zone', 'timestamp with time zone') THEN
    ALTER TABLE "movie" ALTER COLUMN "watchDate" SET DATA TYPE timestamp (3) USING NULLIF("watchDate"::text, '')::timestamp(3);
  END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF (SELECT data_type FROM information_schema.columns WHERE table_name='tierlist' AND column_name='watchDateFrom') <> 'date' THEN
    ALTER TABLE "tierlist" ALTER COLUMN "watchDateFrom" SET DATA TYPE date USING NULLIF("watchDateFrom"::text, '')::date;
  END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF (SELECT data_type FROM information_schema.columns WHERE table_name='tierlist' AND column_name='watchDateTo') <> 'date' THEN
    ALTER TABLE "tierlist" ALTER COLUMN "watchDateTo" SET DATA TYPE date USING NULLIF("watchDateTo"::text, '')::date;
  END IF;
END $$;--> statement-breakpoint
ALTER TABLE "movie" ADD COLUMN IF NOT EXISTS "createdAt" timestamp (3) DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "recommended_movie" ADD COLUMN IF NOT EXISTS "createdAt" timestamp (3) DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "review" ADD COLUMN IF NOT EXISTS "createdAt" timestamp (3) DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "raffle" ADD COLUMN IF NOT EXISTS "createdAt" timestamp (3) DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "tierlist" ADD COLUMN IF NOT EXISTS "createdAt" timestamp (3) DEFAULT now() NOT NULL;--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name='movie_credits_id_movie_id_fk' AND table_name='movie_credits'
  ) THEN
    ALTER TABLE "movie_credits" ADD CONSTRAINT "movie_credits_id_movie_id_fk" FOREIGN KEY ("id") REFERENCES "public"."movie"("id") ON DELETE cascade ON UPDATE cascade;
  END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name='RecommendedMovie_movieId_fkey' AND table_name='recommended_movie'
  ) THEN
    ALTER TABLE "recommended_movie" ADD CONSTRAINT "RecommendedMovie_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "public"."movie"("id") ON DELETE cascade ON UPDATE cascade;
  END IF;
END $$;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "movie_genres_idx" ON "movie" USING gin ("genres");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "_movie_to_raffle_A_idx" ON "_movie_to_raffle" USING btree ("A" text_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "_movie_to_shortlist_A_idx" ON "_movie_to_shortlist" USING btree ("A" text_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "recommended_movie_userId_idx" ON "recommended_movie" USING btree ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "review_movieId_idx" ON "review" USING btree ("movieId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "review_userId_idx" ON "review" USING btree ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "session_expiresAt_idx" ON "session" USING btree ("expiresAt");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "session_userId_idx" ON "session" USING btree ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "movies_on_tiers_tierId_idx" ON "movies_on_tiers" USING btree ("tierId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tier_tierlistId_idx" ON "tier" USING btree ("tierlistId");--> statement-breakpoint
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='movie' AND column_name='cast') THEN ALTER TABLE "movie" DROP COLUMN "cast"; END IF; END $$;--> statement-breakpoint
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='movie' AND column_name='crew') THEN ALTER TABLE "movie" DROP COLUMN "crew"; END IF; END $$;--> statement-breakpoint
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='movie' AND column_name='tierIds') THEN ALTER TABLE "movie" DROP COLUMN "tierIds"; END IF; END $$;--> statement-breakpoint
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='review' AND column_name='timestamp') THEN ALTER TABLE "review" DROP COLUMN "timestamp"; END IF; END $$;--> statement-breakpoint
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user' AND column_name='shortlistId') THEN ALTER TABLE "user" DROP COLUMN "shortlistId"; END IF; END $$;--> statement-breakpoint
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user' AND column_name='accountId') THEN ALTER TABLE "user" DROP COLUMN "accountId"; END IF; END $$;--> statement-breakpoint
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user' AND column_name='sessionId') THEN ALTER TABLE "user" DROP COLUMN "sessionId"; END IF; END $$;