-- Create the shared notify function
CREATE OR REPLACE FUNCTION notify_movieclub_change()
RETURNS trigger AS $$
BEGIN
  PERFORM pg_notify(
    'movieclub_changes',
    json_build_object('table', TG_TABLE_NAME, 'op', TG_OP)::text
  );
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
--> statement-breakpoint

-- movie
DROP TRIGGER IF EXISTS notify_movie_change ON "movie";
--> statement-breakpoint
CREATE TRIGGER notify_movie_change
  AFTER INSERT OR UPDATE OR DELETE ON "movie"
  FOR EACH ROW EXECUTE FUNCTION notify_movieclub_change();
--> statement-breakpoint

-- shortlist
DROP TRIGGER IF EXISTS notify_shortlist_change ON "shortlist";
--> statement-breakpoint
CREATE TRIGGER notify_shortlist_change
  AFTER INSERT OR UPDATE OR DELETE ON "shortlist"
  FOR EACH ROW EXECUTE FUNCTION notify_movieclub_change();
--> statement-breakpoint

-- _movie_to_shortlist
DROP TRIGGER IF EXISTS notify_movie_to_shortlist_change ON "_movie_to_shortlist";
--> statement-breakpoint
CREATE TRIGGER notify_movie_to_shortlist_change
  AFTER INSERT OR DELETE ON "_movie_to_shortlist"
  FOR EACH ROW EXECUTE FUNCTION notify_movieclub_change();
--> statement-breakpoint

-- tierlist
DROP TRIGGER IF EXISTS notify_tierlist_change ON "tierlist";
--> statement-breakpoint
CREATE TRIGGER notify_tierlist_change
  AFTER INSERT OR UPDATE OR DELETE ON "tierlist"
  FOR EACH ROW EXECUTE FUNCTION notify_movieclub_change();
--> statement-breakpoint

-- tier
DROP TRIGGER IF EXISTS notify_tier_change ON "tier";
--> statement-breakpoint
CREATE TRIGGER notify_tier_change
  AFTER INSERT OR DELETE ON "tier"
  FOR EACH ROW EXECUTE FUNCTION notify_movieclub_change();
--> statement-breakpoint

-- movies_on_tiers
DROP TRIGGER IF EXISTS notify_movies_on_tiers_change ON "movies_on_tiers";
--> statement-breakpoint
CREATE TRIGGER notify_movies_on_tiers_change
  AFTER INSERT OR UPDATE OR DELETE ON "movies_on_tiers"
  FOR EACH ROW EXECUTE FUNCTION notify_movieclub_change();
--> statement-breakpoint

-- raffle
DROP TRIGGER IF EXISTS notify_raffle_change ON "raffle";
--> statement-breakpoint
CREATE TRIGGER notify_raffle_change
  AFTER INSERT ON "raffle"
  FOR EACH ROW EXECUTE FUNCTION notify_movieclub_change();
--> statement-breakpoint

-- _raffle_to_user
DROP TRIGGER IF EXISTS notify_raffle_to_user_change ON "_raffle_to_user";
--> statement-breakpoint
CREATE TRIGGER notify_raffle_to_user_change
  AFTER INSERT ON "_raffle_to_user"
  FOR EACH ROW EXECUTE FUNCTION notify_movieclub_change();
