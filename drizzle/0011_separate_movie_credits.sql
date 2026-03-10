-- Step 1: Create the movie_credits table
CREATE TABLE IF NOT EXISTS "movie_credits" (
  "id" text PRIMARY KEY NOT NULL,
  "cast" jsonb DEFAULT null,
  "crew" jsonb DEFAULT null
);
--> statement-breakpoint

-- Step 2: Copy cast/crew data from movie table (only if cast/crew columns still exist on movie)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='movie' AND column_name='cast') THEN
    INSERT INTO "movie_credits" ("id", "cast", "crew")
    SELECT "id", "cast", "crew"
    FROM "movie"
    WHERE ("cast" IS NOT NULL OR "crew" IS NOT NULL)
    ON CONFLICT ("id") DO NOTHING;
  END IF;
END $$;
--> statement-breakpoint

-- Step 3: Add foreign key constraint
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name='movie_credits_id_movie_id_fk' AND table_name='movie_credits'
  ) THEN
    ALTER TABLE "movie_credits" ADD CONSTRAINT "movie_credits_id_movie_id_fk" FOREIGN KEY ("id") REFERENCES "public"."movie"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
--> statement-breakpoint

-- Step 4: Drop cast and crew columns from movie table (only if they still exist)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='movie' AND column_name='cast') THEN
    ALTER TABLE "movie" DROP COLUMN "cast";
  END IF;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='movie' AND column_name='crew') THEN
    ALTER TABLE "movie" DROP COLUMN "crew";
  END IF;
END $$;
