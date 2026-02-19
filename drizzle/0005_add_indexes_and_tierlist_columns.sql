ALTER TABLE "tierlist" ADD COLUMN IF NOT EXISTS "watchDateFrom" text;--> statement-breakpoint
ALTER TABLE "tierlist" ADD COLUMN IF NOT EXISTS "watchDateTo" text;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "movie_watchDate_idx" ON "movie" USING btree ("watchDate");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "movie_userId_idx" ON "movie" USING btree ("userId");
