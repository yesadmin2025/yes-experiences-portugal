
CREATE TABLE IF NOT EXISTS public.builder_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  anonymous_id text NOT NULL,
  event text NOT NULL,
  route text,
  meta jsonb,
  occurred_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.builder_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon can insert builder event"
  ON public.builder_events
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(anonymous_id) >= 8 AND length(anonymous_id) <= 64
    AND length(event) >= 1 AND length(event) <= 64
  );

CREATE INDEX IF NOT EXISTS builder_events_event_idx
  ON public.builder_events (event, occurred_at DESC);
