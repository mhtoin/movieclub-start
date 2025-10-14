
CREATE TYPE "public"."Trailer" AS ENUM('name', 'id', 'key');--> statement-breakpoint
CREATE TABLE "Movie" (
	"id" text PRIMARY KEY NOT NULL,
	"adult" boolean NOT NULL,
	"backdrop_path" text DEFAULT '',
	"genre_ids" integer[],
	"tmdbId" integer NOT NULL,
	"imdbId" text,
	"original_language" text NOT NULL,
	"original_title" text NOT NULL,
	"overview" text NOT NULL,
	"popularity" double precision NOT NULL,
	"poster_path" text DEFAULT '',
	"release_date" text NOT NULL,
	"title" text NOT NULL,
	"video" boolean NOT NULL,
	"vote_average" double precision NOT NULL,
	"vote_count" integer NOT NULL,
	"movieOfTheWeek" timestamp(3),
	"watchDate" text,
	"shortlistIDs" text[],
	"userId" text,
	"raffleIDs" text[],
	"runtime" integer,
	"genres" text[],
	"tagline" text,
	"watchProviders" jsonb,
	"images" jsonb,
	"videos" jsonb,
	"cast" jsonb,
	"crew" jsonb,
	"tierIds" text[]
);
--> statement-breakpoint
CREATE TABLE "MoviesOnTiers" (
	"id" text PRIMARY KEY NOT NULL,
	"position" integer NOT NULL,
	"movieId" text NOT NULL,
	"tierId" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Account" (
	"id" text PRIMARY KEY NOT NULL,
	"access_token" text,
	"expires_at" integer,
	"provider" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"refresh_token" text,
	"scope" text,
	"token_type" text,
	"type" text,
	"userId" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Shortlist" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"movieIDs" text[],
	"isReady" boolean DEFAULT false NOT NULL,
	"requiresSelection" boolean DEFAULT false,
	"selectedIndex" integer,
	"participating" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Review" (
	"id" text PRIMARY KEY NOT NULL,
	"content" text NOT NULL,
	"userId" text NOT NULL,
	"movieId" text NOT NULL,
	"timestamp" text NOT NULL,
	"rating" double precision NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Session" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"expiresAt" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "RecommendedMovie" (
	"id" text PRIMARY KEY NOT NULL,
	"movieId" text NOT NULL,
	"userId" text NOT NULL,
	"sourceMovieId" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Raffle" (
	"id" text PRIMARY KEY NOT NULL,
	"participantIDs" text[],
	"movieIDs" text[],
	"winningMovieID" text NOT NULL,
	"date" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "_prisma_migrations" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"checksum" varchar(64) NOT NULL,
	"finished_at" timestamp with time zone,
	"migration_name" varchar(255) NOT NULL,
	"logs" text,
	"rolled_back_at" timestamp with time zone,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"applied_steps_count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "User" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"emailVerified" timestamp(3),
	"image" text NOT NULL,
	"name" text NOT NULL,
	"shortlistId" text,
	"raffleIDs" text[],
	"tmdbAccountId" integer,
	"tmdbSessionId" text,
	"accountId" integer,
	"sessionId" text,
	"radarrApiKey" text,
	"radarrEnabled" boolean DEFAULT false NOT NULL,
	"radarrMonitored" boolean DEFAULT true NOT NULL,
	"radarrQualityProfileId" integer,
	"radarrRootFolder" text,
	"radarrUrl" text
);
--> statement-breakpoint
CREATE TABLE "SiteConfig" (
	"id" text PRIMARY KEY NOT NULL,
	"watchProviders" jsonb,
	"watchWeekDay" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Tierlist" (
	"id" text PRIMARY KEY NOT NULL,
	"tierIds" text[],
	"userId" text NOT NULL,
	"title" text,
	"watchDate" jsonb,
	"genres" text[]
);
--> statement-breakpoint
CREATE TABLE "Tier" (
	"id" text PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	"value" integer NOT NULL,
	"tierlistId" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "_MovieToShortlist" (
	"A" text NOT NULL,
	"B" text NOT NULL,
	CONSTRAINT "_MovieToShortlist_AB_pkey" PRIMARY KEY("A","B")
);
--> statement-breakpoint
CREATE TABLE "_MovieToRaffle" (
	"A" text NOT NULL,
	"B" text NOT NULL,
	CONSTRAINT "_MovieToRaffle_AB_pkey" PRIMARY KEY("A","B")
);
--> statement-breakpoint
CREATE TABLE "_RaffleToUser" (
	"A" text NOT NULL,
	"B" text NOT NULL,
	CONSTRAINT "_RaffleToUser_AB_pkey" PRIMARY KEY("A","B")
);
--> statement-breakpoint
ALTER TABLE "Movie" ADD CONSTRAINT "Movie_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "MoviesOnTiers" ADD CONSTRAINT "MoviesOnTiers_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "public"."Movie"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "MoviesOnTiers" ADD CONSTRAINT "MoviesOnTiers_tierId_fkey" FOREIGN KEY ("tierId") REFERENCES "public"."Tier"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Shortlist" ADD CONSTRAINT "Shortlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Review" ADD CONSTRAINT "Review_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "public"."Movie"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "RecommendedMovie" ADD CONSTRAINT "RecommendedMovie_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "public"."Movie"("id") ON DELETE set default ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "RecommendedMovie" ADD CONSTRAINT "RecommendedMovie_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "RecommendedMovie" ADD CONSTRAINT "RecommendedMovie_sourceMovieId_fkey" FOREIGN KEY ("sourceMovieId") REFERENCES "public"."Movie"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Tierlist" ADD CONSTRAINT "Tierlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Tier" ADD CONSTRAINT "Tier_tierlistId_fkey" FOREIGN KEY ("tierlistId") REFERENCES "public"."Tierlist"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "_MovieToShortlist" ADD CONSTRAINT "_MovieToShortlist_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Movie"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "_MovieToShortlist" ADD CONSTRAINT "_MovieToShortlist_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Shortlist"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "_MovieToRaffle" ADD CONSTRAINT "_MovieToRaffle_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Movie"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "_MovieToRaffle" ADD CONSTRAINT "_MovieToRaffle_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Raffle"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "_RaffleToUser" ADD CONSTRAINT "_RaffleToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Raffle"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "_RaffleToUser" ADD CONSTRAINT "_RaffleToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE UNIQUE INDEX "Movie_tmdbId_key" ON "Movie" USING btree ("tmdbId" int4_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "MoviesOnTiers_movieId_tierId_key" ON "MoviesOnTiers" USING btree ("movieId" text_ops,"tierId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "Account_providerAccountId_key" ON "Account" USING btree ("providerAccountId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account" USING btree ("provider" text_ops,"providerAccountId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "Shortlist_userId_key" ON "Shortlist" USING btree ("userId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "RecommendedMovie_movieId_userId_sourceMovieId_key" ON "RecommendedMovie" USING btree ("movieId" text_ops,"userId" text_ops,"sourceMovieId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "User_email_key" ON "User" USING btree ("email" text_ops);--> statement-breakpoint
CREATE INDEX "_MovieToShortlist_B_index" ON "_MovieToShortlist" USING btree ("B" text_ops);--> statement-breakpoint
CREATE INDEX "_MovieToRaffle_B_index" ON "_MovieToRaffle" USING btree ("B" text_ops);--> statement-breakpoint
CREATE INDEX "_RaffleToUser_B_index" ON "_RaffleToUser" USING btree ("B" text_ops);