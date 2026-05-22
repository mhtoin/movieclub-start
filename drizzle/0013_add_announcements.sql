CREATE TABLE "announcement" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"type" text NOT NULL,
	"isPublished" boolean DEFAULT false NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "announcement_dismissal" (
	"userId" text NOT NULL,
	"announcementId" text NOT NULL,
	"dismissedAt" timestamp (3) DEFAULT now() NOT NULL,
	CONSTRAINT "announcement_dismissal_userId_announcementId_pk" PRIMARY KEY("userId","announcementId")
);
--> statement-breakpoint
ALTER TABLE "review" DROP CONSTRAINT "Review_userId_fkey";
--> statement-breakpoint
ALTER TABLE "review" ALTER COLUMN "userId" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "role" text DEFAULT 'user' NOT NULL;--> statement-breakpoint
ALTER TABLE "announcement_dismissal" ADD CONSTRAINT "announcement_dismissal_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "announcement_dismissal" ADD CONSTRAINT "announcement_dismissal_announcementId_announcement_id_fk" FOREIGN KEY ("announcementId") REFERENCES "public"."announcement"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE cascade;