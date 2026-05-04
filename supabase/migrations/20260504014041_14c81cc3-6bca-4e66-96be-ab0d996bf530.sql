-- Set immutable search_path on validation triggers.
ALTER FUNCTION public.hero_ab_events_validate() SET search_path = public, pg_temp;
ALTER FUNCTION public.hero_ab_assignments_validate() SET search_path = public, pg_temp;

-- Replace WITH CHECK (true) with concrete bounds. The trigger still
-- enforces the canonical event whitelist; the policy gives the DB a
-- cheap first-line check that doesn't require executing plpgsql.
DROP POLICY "anon can insert hero ab assignment" ON public.hero_ab_assignments;
DROP POLICY "anon can insert hero ab event" ON public.hero_ab_events;

CREATE POLICY "anon can insert hero ab assignment"
  ON public.hero_ab_assignments
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(anonymous_id) BETWEEN 8 AND 64
    AND length(experiment_key) BETWEEN 1 AND 64
    AND length(variant) BETWEEN 1 AND 32
  );

CREATE POLICY "anon can insert hero ab event"
  ON public.hero_ab_events
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(anonymous_id) BETWEEN 8 AND 64
    AND length(experiment_key) BETWEEN 1 AND 64
    AND length(variant) BETWEEN 1 AND 32
    AND event IN ('exposure','cta_click','builder_start','booking','view_signature')
  );
