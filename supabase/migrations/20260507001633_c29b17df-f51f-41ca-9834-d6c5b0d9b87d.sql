
ALTER TABLE public.builder_routing_rules
  ADD COLUMN IF NOT EXISTS max_km_between_stops numeric NOT NULL DEFAULT 60,
  ADD COLUMN IF NOT EXISTS max_total_km_per_day numeric NOT NULL DEFAULT 250;
