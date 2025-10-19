ALTER TABLE "Session" ADD COLUMN "secretHash" text NOT NULL;--> statement-breakpoint
ALTER TABLE "Session" ADD COLUMN "createdAt" timestamp (3) NOT NULL;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "password" text;