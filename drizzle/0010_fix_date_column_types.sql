-- movie.watchDate: text → timestamp (nullable)
DO $$ BEGIN
  IF (SELECT data_type FROM information_schema.columns WHERE table_name='movie' AND column_name='watchDate') NOT IN ('timestamp without time zone', 'timestamp with time zone') THEN
    ALTER TABLE "movie" ALTER COLUMN "watchDate" TYPE timestamp(3) USING NULLIF("watchDate"::text, '')::timestamp(3);
  END IF;
END $$;

-- movie.release_date: text NOT NULL → date nullable (guard against empty strings)
DO $$ BEGIN
  IF (SELECT data_type FROM information_schema.columns WHERE table_name='movie' AND column_name='release_date') <> 'date' THEN
    ALTER TABLE "movie" ALTER COLUMN "release_date" DROP NOT NULL;
    ALTER TABLE "movie" ALTER COLUMN "release_date" TYPE date USING NULLIF("release_date"::text, '')::date;
  END IF;
END $$;

-- raffle.date: text → timestamp(3), rename to raffledAt
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='raffle' AND column_name='date') THEN
    ALTER TABLE "raffle" ALTER COLUMN "date" TYPE timestamp(3) USING NULLIF("date"::text, '')::timestamp(3);
    ALTER TABLE "raffle" RENAME COLUMN "date" TO "raffledAt";
  END IF;
END $$;

-- review: drop legacy text timestamp column (createdAt timestamp column already exists)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='review' AND column_name='timestamp') THEN
    ALTER TABLE "review" DROP COLUMN "timestamp";
  END IF;
END $$;

-- tierlist.watchDateFrom / watchDateTo: text → date (nullable)
DO $$ BEGIN
  IF (SELECT data_type FROM information_schema.columns WHERE table_name='tierlist' AND column_name='watchDateFrom') <> 'date' THEN
    ALTER TABLE "tierlist" ALTER COLUMN "watchDateFrom" TYPE date USING NULLIF("watchDateFrom"::text, '')::date;
  END IF;
END $$;
DO $$ BEGIN
  IF (SELECT data_type FROM information_schema.columns WHERE table_name='tierlist' AND column_name='watchDateTo') <> 'date' THEN
    ALTER TABLE "tierlist" ALTER COLUMN "watchDateTo" TYPE date USING NULLIF("watchDateTo"::text, '')::date;
  END IF;
END $$;
