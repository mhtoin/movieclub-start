CREATE TABLE "movie_credits" (
	"id" text PRIMARY KEY NOT NULL,
	"cast" jsonb DEFAULT 'null'::jsonb,
	"crew" jsonb DEFAULT 'null'::jsonb
);
--> statement-breakpoint
ALTER TABLE "raffle" RENAME COLUMN "winningMovieID" TO "winningMovieId";--> statement-breakpoint
ALTER TABLE "raffle" RENAME COLUMN "date" TO "raffledAt";--> statement-breakpoint
ALTER TABLE "recommended_movie" DROP CONSTRAINT "RecommendedMovie_movieId_fkey";
--> statement-breakpoint
ALTER TABLE "movie" ALTER COLUMN "release_date" SET DATA TYPE date;--> statement-breakpoint
ALTER TABLE "movie" ALTER COLUMN "release_date" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "movie" ALTER COLUMN "watchDate" SET DATA TYPE timestamp (3);--> statement-breakpoint
ALTER TABLE "tierlist" ALTER COLUMN "watchDateFrom" SET DATA TYPE date;--> statement-breakpoint
ALTER TABLE "tierlist" ALTER COLUMN "watchDateTo" SET DATA TYPE date;--> statement-breakpoint
ALTER TABLE "movie" ADD COLUMN "createdAt" timestamp (3) DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "recommended_movie" ADD COLUMN "createdAt" timestamp (3) DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "review" ADD COLUMN "createdAt" timestamp (3) DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "raffle" ADD COLUMN "createdAt" timestamp (3) DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "tierlist" ADD COLUMN "createdAt" timestamp (3) DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "movie_credits" ADD CONSTRAINT "movie_credits_id_movie_id_fk" FOREIGN KEY ("id") REFERENCES "public"."movie"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "recommended_movie" ADD CONSTRAINT "RecommendedMovie_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "public"."movie"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "movie_genres_idx" ON "movie" USING gin ("genres");--> statement-breakpoint
CREATE INDEX "_movie_to_raffle_A_idx" ON "_movie_to_raffle" USING btree ("A" text_ops);--> statement-breakpoint
CREATE INDEX "_movie_to_shortlist_A_idx" ON "_movie_to_shortlist" USING btree ("A" text_ops);--> statement-breakpoint
CREATE INDEX "recommended_movie_userId_idx" ON "recommended_movie" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "review_movieId_idx" ON "review" USING btree ("movieId");--> statement-breakpoint
CREATE INDEX "review_userId_idx" ON "review" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "session_expiresAt_idx" ON "session" USING btree ("expiresAt");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "movies_on_tiers_tierId_idx" ON "movies_on_tiers" USING btree ("tierId");--> statement-breakpoint
CREATE INDEX "tier_tierlistId_idx" ON "tier" USING btree ("tierlistId");--> statement-breakpoint
ALTER TABLE "movie" DROP COLUMN "cast";--> statement-breakpoint
ALTER TABLE "movie" DROP COLUMN "crew";--> statement-breakpoint
ALTER TABLE "movie" DROP COLUMN "tierIds";--> statement-breakpoint
ALTER TABLE "review" DROP COLUMN "timestamp";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "shortlistId";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "accountId";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "sessionId";