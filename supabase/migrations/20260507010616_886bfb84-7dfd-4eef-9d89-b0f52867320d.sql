
-- 1) Revocation flag for shared journeys
ALTER TABLE public.builder_journeys
  ADD COLUMN IF NOT EXISTS revoked_at timestamptz;

-- 2) Lightweight server-side rate limit table for anon endpoints
CREATE TABLE IF NOT EXISTS public.builder_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  bucket text NOT NULL,
  last_call_at timestamptz NOT NULL DEFAULT now(),
  call_count integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS builder_rate_limits_unique
  ON public.builder_rate_limits (session_id, bucket);

ALTER TABLE public.builder_rate_limits ENABLE ROW LEVEL SECURITY;

-- Admins only; server functions use service role and bypass RLS.
CREATE POLICY "Admins can read builder_rate_limits"
  ON public.builder_rate_limits FOR SELECT
  TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage builder_rate_limits delete"
  ON public.builder_rate_limits FOR DELETE
  TO authenticated USING (public.has_role(auth.uid(), 'admin'));
