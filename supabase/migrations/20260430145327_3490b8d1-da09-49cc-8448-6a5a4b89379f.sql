-- Audit log for AI narrative key usage events
CREATE TABLE public.ai_usage_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  provider TEXT NOT NULL,
  model TEXT,
  feature TEXT NOT NULL,
  status TEXT NOT NULL,
  latency_ms INTEGER,
  config_hash TEXT,
  error_code TEXT,
  error_message TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX idx_ai_usage_logs_created_at ON public.ai_usage_logs (created_at DESC);
CREATE INDEX idx_ai_usage_logs_provider ON public.ai_usage_logs (provider, created_at DESC);
CREATE INDEX idx_ai_usage_logs_status ON public.ai_usage_logs (status, created_at DESC);

ALTER TABLE public.ai_usage_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can read
CREATE POLICY "Admins can read ai_usage_logs"
  ON public.ai_usage_logs FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- No client INSERT/UPDATE/DELETE policies — server-side only via service role
