
-- Builder journeys: persisted multi-day state, share-by-token, owner-edits-by-token

CREATE TABLE IF NOT EXISTS public.builder_journeys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  share_token text NOT NULL UNIQUE,
  owner_token_hash text NOT NULL,
  state jsonb NOT NULL DEFAULT '{}'::jsonb,
  intent text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS builder_journeys_share_token_idx ON public.builder_journeys (share_token);

ALTER TABLE public.builder_journeys ENABLE ROW LEVEL SECURITY;

-- All reads/writes happen via server functions using the service role,
-- which bypasses RLS. Lock down direct anon/auth access entirely.
CREATE POLICY "Admins can read builder_journeys"
  ON public.builder_journeys FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update builder_journeys"
  ON public.builder_journeys FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete builder_journeys"
  ON public.builder_journeys FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER builder_journeys_set_updated_at
  BEFORE UPDATE ON public.builder_journeys
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
