CREATE TABLE "password_reset_token" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"token" text NOT NULL,
	"expiresAt" timestamp (3) NOT NULL,
	CONSTRAINT "password_reset_token_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "tierlist" ADD COLUMN "watchDateFrom" text;--> statement-breakpoint
ALTER TABLE "tierlist" ADD COLUMN "watchDateTo" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "colorScheme" text DEFAULT 'default' NOT NULL;--> statement-breakpoint
ALTER TABLE "password_reset_token" ADD CONSTRAINT "password_reset_token_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "movie_watchDate_idx" ON "movie" USING btree ("watchDate");--> statement-breakpoint
CREATE INDEX "movie_userId_idx" ON "movie" USING btree ("userId");--> statement-breakpoint
ALTER TABLE "tierlist" DROP COLUMN "watchDate";