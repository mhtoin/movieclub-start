CREATE TABLE "web_vital_metric" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"value" double precision NOT NULL,
	"rating" text NOT NULL,
	"route_key" text NOT NULL,
	"navigation_type" text NOT NULL,
	"bucket_start" timestamp (0) with time zone NOT NULL,
	CONSTRAINT "web_vital_metric_name_check" CHECK ("name" in ('CLS', 'FCP', 'INP', 'LCP', 'TTFB')),
 	CONSTRAINT "web_vital_metric_value_check" CHECK ("value" >= 0 AND "value" <= 600000),
	CONSTRAINT "web_vital_metric_rating_check" CHECK ("rating" in ('good', 'needs-improvement', 'poor')),
 	CONSTRAINT "web_vital_metric_route_key_check" CHECK ("route_key" in ('landing', 'home', 'discover', 'shortlists', 'raffle', 'dashboard', 'settings', 'admin', 'tierlist', 'watched', 'reset-password', 'auth', 'other')),
	CONSTRAINT "web_vital_metric_navigation_type_check" CHECK ("navigation_type" in ('navigate', 'reload', 'back-forward', 'back-forward-cache', 'prerender', 'restore'))
);
--> statement-breakpoint
CREATE INDEX "web_vital_metric_bucket_start_idx" ON "web_vital_metric" USING btree ("bucket_start");
