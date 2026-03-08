-- movie.watchDate: text → timestamp (nullable)
ALTER TABLE "movie" ALTER COLUMN "watchDate" TYPE timestamp(3) USING NULLIF("watchDate", '')::timestamp(3);

-- movie.release_date: text NOT NULL → date nullable (guard against empty strings)
ALTER TABLE "movie" ALTER COLUMN "release_date" DROP NOT NULL;
ALTER TABLE "movie" ALTER COLUMN "release_date" TYPE date USING NULLIF("release_date", '')::date;

-- raffle.date: text → timestamp(3), rename to raffledAt
ALTER TABLE "raffle" ALTER COLUMN "date" TYPE timestamp(3) USING NULLIF("date", '')::timestamp(3);
ALTER TABLE "raffle" RENAME COLUMN "date" TO "raffledAt";

-- review: drop legacy text timestamp column (createdAt timestamp column already exists)
ALTER TABLE "review" DROP COLUMN "timestamp";

-- tierlist.watchDateFrom / watchDateTo: text → date (nullable)
ALTER TABLE "tierlist" ALTER COLUMN "watchDateFrom" TYPE date USING NULLIF("watchDateFrom", '')::date;
ALTER TABLE "tierlist" ALTER COLUMN "watchDateTo" TYPE date USING NULLIF("watchDateTo", '')::date;
