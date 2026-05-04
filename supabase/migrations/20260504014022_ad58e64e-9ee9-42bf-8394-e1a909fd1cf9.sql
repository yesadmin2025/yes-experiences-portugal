-- Hero copy A/B testing tables.
--
-- Two tables, append-only, anonymous-only writes via anon role.
-- No PII: we store a random anonymous_id generated client-side and
-- persisted in a first-party cookie / localStorage. Nothing in here
-- can be joined back to auth.users.
--
-- READS: deliberately not exposed via RLS — analytics dashboards
-- should run server-side with the service role key.

CREATE TABLE public.hero_ab_assignments (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  anonymous_id  text NOT NULL,
  experiment_key text NOT NULL,
  variant       text NOT NULL,
  assigned_at   timestamptz NOT NULL DEFAULT now(),
  user_agent    text,
  UNIQUE (anonymous_id, experiment_key)
);

CREATE INDEX hero_ab_assignments_experiment_idx
  ON public.hero_ab_assignments (experiment_key, variant);

CREATE TABLE public.hero_ab_events (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  anonymous_id   text NOT NULL,
  experiment_key text NOT NULL,
  variant        text NOT NULL,
  event          text NOT NULL,           -- 'exposure' | 'cta_click' | 'builder_start' | 'booking'
  scene_id       text,
  route          text,
  meta           jsonb,
  occurred_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX hero_ab_events_experiment_event_idx
  ON public.hero_ab_events (experiment_key, event, occurred_at DESC);
CREATE INDEX hero_ab_events_anonymous_idx
  ON public.hero_ab_events (anonymous_id, occurred_at DESC);

-- Validation: only sane values for `event`. Trigger (not CHECK) so the
-- allowed list can grow without table rewrites.
CREATE OR REPLACE FUNCTION public.hero_ab_events_validate()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.event NOT IN ('exposure', 'cta_click', 'builder_start', 'booking', 'view_signature') THEN
    RAISE EXCEPTION 'invalid hero_ab_events.event: %', NEW.event;
  END IF;
  IF length(NEW.anonymous_id) < 8 OR length(NEW.anonymous_id) > 64 THEN
    RAISE EXCEPTION 'invalid anonymous_id length';
  END IF;
  IF length(NEW.experiment_key) > 64 OR length(NEW.variant) > 32 THEN
    RAISE EXCEPTION 'experiment_key/variant too long';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER hero_ab_events_validate_t
  BEFORE INSERT ON public.hero_ab_events
  FOR EACH ROW EXECUTE FUNCTION public.hero_ab_events_validate();

CREATE OR REPLACE FUNCTION public.hero_ab_assignments_validate()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF length(NEW.anonymous_id) < 8 OR length(NEW.anonymous_id) > 64 THEN
    RAISE EXCEPTION 'invalid anonymous_id length';
  END IF;
  IF length(NEW.experiment_key) > 64 OR length(NEW.variant) > 32 THEN
    RAISE EXCEPTION 'experiment_key/variant too long';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER hero_ab_assignments_validate_t
  BEFORE INSERT ON public.hero_ab_assignments
  FOR EACH ROW EXECUTE FUNCTION public.hero_ab_assignments_validate();

-- RLS: anon may INSERT only. No SELECT/UPDATE/DELETE for anon or authenticated.
ALTER TABLE public.hero_ab_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_ab_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon can insert hero ab assignment"
  ON public.hero_ab_assignments
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "anon can insert hero ab event"
  ON public.hero_ab_events
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
