ALTER TABLE "_prisma_migrations" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "_prisma_migrations" CASCADE;--> statement-breakpoint
ALTER TABLE "Movie" ADD CONSTRAINT "Movie_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Movie" DROP COLUMN "backdrop_path";--> statement-breakpoint
ALTER TABLE "Movie" DROP COLUMN "genre_ids";--> statement-breakpoint
ALTER TABLE "Movie" DROP COLUMN "poster_path";--> statement-breakpoint
ALTER TABLE "Movie" DROP COLUMN "movieOfTheWeek";--> statement-breakpoint
ALTER TABLE "Movie" DROP COLUMN "shortlistIDs";--> statement-breakpoint
ALTER TABLE "Movie" DROP COLUMN "raffleIDs";--> statement-breakpoint
ALTER TABLE "Shortlist" DROP COLUMN "movieIDs";--> statement-breakpoint
ALTER TABLE "Raffle" DROP COLUMN "participantIDs";--> statement-breakpoint
ALTER TABLE "Raffle" DROP COLUMN "movieIDs";--> statement-breakpoint
ALTER TABLE "User" DROP COLUMN "raffleIDs";--> statement-breakpoint
ALTER TABLE "Tierlist" DROP COLUMN "tierIds";