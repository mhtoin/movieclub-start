ALTER TABLE "Movie" ALTER COLUMN "watchProviders" SET DEFAULT 'null'::jsonb;--> statement-breakpoint
ALTER TABLE "Movie" ALTER COLUMN "images" SET DEFAULT 'null'::jsonb;--> statement-breakpoint
ALTER TABLE "Movie" ALTER COLUMN "videos" SET DEFAULT 'null'::jsonb;--> statement-breakpoint
ALTER TABLE "Movie" ALTER COLUMN "cast" SET DEFAULT 'null'::jsonb;--> statement-breakpoint
ALTER TABLE "Movie" ALTER COLUMN "crew" SET DEFAULT 'null'::jsonb;