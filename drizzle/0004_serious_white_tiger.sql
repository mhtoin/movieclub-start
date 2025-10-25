ALTER TABLE "Movie" RENAME TO "movie";--> statement-breakpoint
ALTER TABLE "_MovieToRaffle" RENAME TO "_movie_to_raffle";--> statement-breakpoint
ALTER TABLE "_MovieToShortlist" RENAME TO "_movie_to_shortlist";--> statement-breakpoint
ALTER TABLE "RecommendedMovie" RENAME TO "recommended_movie";--> statement-breakpoint
ALTER TABLE "Review" RENAME TO "review";--> statement-breakpoint
ALTER TABLE "Raffle" RENAME TO "raffle";--> statement-breakpoint
ALTER TABLE "_RaffleToUser" RENAME TO "_raffle_to_user";--> statement-breakpoint
ALTER TABLE "Session" RENAME TO "session";--> statement-breakpoint
ALTER TABLE "Shortlist" RENAME TO "shortlist";--> statement-breakpoint
ALTER TABLE "SiteConfig" RENAME TO "site_config";--> statement-breakpoint
ALTER TABLE "MoviesOnTiers" RENAME TO "movies_on_tiers";--> statement-breakpoint
ALTER TABLE "Tier" RENAME TO "tier";--> statement-breakpoint
ALTER TABLE "Tierlist" RENAME TO "tierlist";--> statement-breakpoint
ALTER TABLE "Account" RENAME TO "account";--> statement-breakpoint
ALTER TABLE "User" RENAME TO "user";--> statement-breakpoint
ALTER TABLE "movie" DROP CONSTRAINT "Movie_userId_User_id_fk";
--> statement-breakpoint
ALTER TABLE "movie" DROP CONSTRAINT "Movie_userId_fkey";
--> statement-breakpoint
ALTER TABLE "_movie_to_raffle" DROP CONSTRAINT "_MovieToRaffle_A_fkey";
--> statement-breakpoint
ALTER TABLE "_movie_to_raffle" DROP CONSTRAINT "_MovieToRaffle_B_fkey";
--> statement-breakpoint
ALTER TABLE "_movie_to_shortlist" DROP CONSTRAINT "_MovieToShortlist_A_fkey";
--> statement-breakpoint
ALTER TABLE "_movie_to_shortlist" DROP CONSTRAINT "_MovieToShortlist_B_fkey";
--> statement-breakpoint
ALTER TABLE "recommended_movie" DROP CONSTRAINT "RecommendedMovie_movieId_fkey";
--> statement-breakpoint
ALTER TABLE "recommended_movie" DROP CONSTRAINT "RecommendedMovie_userId_fkey";
--> statement-breakpoint
ALTER TABLE "recommended_movie" DROP CONSTRAINT "RecommendedMovie_sourceMovieId_fkey";
--> statement-breakpoint
ALTER TABLE "review" DROP CONSTRAINT "Review_userId_fkey";
--> statement-breakpoint
ALTER TABLE "review" DROP CONSTRAINT "Review_movieId_fkey";
--> statement-breakpoint
ALTER TABLE "_raffle_to_user" DROP CONSTRAINT "_RaffleToUser_A_fkey";
--> statement-breakpoint
ALTER TABLE "_raffle_to_user" DROP CONSTRAINT "_RaffleToUser_B_fkey";
--> statement-breakpoint
ALTER TABLE "session" DROP CONSTRAINT "Session_userId_fkey";
--> statement-breakpoint
ALTER TABLE "shortlist" DROP CONSTRAINT "Shortlist_userId_fkey";
--> statement-breakpoint
ALTER TABLE "movies_on_tiers" DROP CONSTRAINT "MoviesOnTiers_movieId_fkey";
--> statement-breakpoint
ALTER TABLE "movies_on_tiers" DROP CONSTRAINT "MoviesOnTiers_tierId_fkey";
--> statement-breakpoint
ALTER TABLE "tier" DROP CONSTRAINT "Tier_tierlistId_fkey";
--> statement-breakpoint
ALTER TABLE "tierlist" DROP CONSTRAINT "Tierlist_userId_fkey";
--> statement-breakpoint
ALTER TABLE "account" DROP CONSTRAINT "Account_userId_fkey";
--> statement-breakpoint
DROP INDEX "_MovieToRaffle_B_index";--> statement-breakpoint
DROP INDEX "_MovieToShortlist_B_index";--> statement-breakpoint
DROP INDEX "_RaffleToUser_B_index";--> statement-breakpoint
ALTER TABLE "movie" ADD CONSTRAINT "movie_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movie" ADD CONSTRAINT "Movie_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "_movie_to_raffle" ADD CONSTRAINT "_MovieToRaffle_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."movie"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "_movie_to_raffle" ADD CONSTRAINT "_MovieToRaffle_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."raffle"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "_movie_to_shortlist" ADD CONSTRAINT "_MovieToShortlist_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."movie"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "_movie_to_shortlist" ADD CONSTRAINT "_MovieToShortlist_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."shortlist"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "recommended_movie" ADD CONSTRAINT "RecommendedMovie_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "public"."movie"("id") ON DELETE set default ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "recommended_movie" ADD CONSTRAINT "RecommendedMovie_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "recommended_movie" ADD CONSTRAINT "RecommendedMovie_sourceMovieId_fkey" FOREIGN KEY ("sourceMovieId") REFERENCES "public"."movie"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "review" ADD CONSTRAINT "Review_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "public"."movie"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "_raffle_to_user" ADD CONSTRAINT "_RaffleToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."raffle"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "_raffle_to_user" ADD CONSTRAINT "_RaffleToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "shortlist" ADD CONSTRAINT "Shortlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "movies_on_tiers" ADD CONSTRAINT "MoviesOnTiers_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "public"."movie"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "movies_on_tiers" ADD CONSTRAINT "MoviesOnTiers_tierId_fkey" FOREIGN KEY ("tierId") REFERENCES "public"."tier"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "tier" ADD CONSTRAINT "Tier_tierlistId_fkey" FOREIGN KEY ("tierlistId") REFERENCES "public"."tierlist"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "tierlist" ADD CONSTRAINT "Tierlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "_movie_to_raffle_B_index" ON "_movie_to_raffle" USING btree ("B" text_ops);--> statement-breakpoint
CREATE INDEX "_movie_to_shortlist_B_index" ON "_movie_to_shortlist" USING btree ("B" text_ops);--> statement-breakpoint
CREATE INDEX "_raffle_to_user_B_index" ON "_raffle_to_user" USING btree ("B" text_ops);