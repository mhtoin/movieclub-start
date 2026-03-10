-- Step 1: Create the movie_credits table
CREATE TABLE "movie_credits" (
  "id" text PRIMARY KEY NOT NULL,
  "cast" jsonb DEFAULT null,
  "crew" jsonb DEFAULT null
);
--> statement-breakpoint

-- Step 2: Copy cast/crew data from movie table
INSERT INTO "movie_credits" ("id", "cast", "crew")
SELECT "id", "cast", "crew"
FROM "movie"
WHERE "cast" IS NOT NULL OR "crew" IS NOT NULL;
--> statement-breakpoint

-- Step 3: Add foreign key constraint
ALTER TABLE "movie_credits" ADD CONSTRAINT "movie_credits_id_movie_id_fk" FOREIGN KEY ("id") REFERENCES "public"."movie"("id") ON DELETE CASCADE ON UPDATE CASCADE;
--> statement-breakpoint

-- Step 4: Drop cast and crew columns from movie table
ALTER TABLE "movie" DROP COLUMN "cast";
--> statement-breakpoint
ALTER TABLE "movie" DROP COLUMN "crew";
