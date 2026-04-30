-- Phase 2B: clear legacy seed stops before loading real Viator data
DELETE FROM public.builder_stops WHERE canonical_key IS NULL;