-- Phase 2A: Schema + regions for the real-data Builder

-- 1. Extend builder_stops with canonical key, variant bucket, source provenance
ALTER TABLE public.builder_stops
  ADD COLUMN IF NOT EXISTS canonical_key text,
  ADD COLUMN IF NOT EXISTS variant_bucket text,
  ADD COLUMN IF NOT EXISTS source_tour_keys text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS variant_label text;
CREATE INDEX IF NOT EXISTS builder_stops_canonical_idx ON public.builder_stops(canonical_key);
CREATE INDEX IF NOT EXISTS builder_stops_region_idx ON public.builder_stops(region_key);

-- 2. Source tours
CREATE TABLE IF NOT EXISTS public.builder_tour_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_key text UNIQUE NOT NULL,
  title text NOT NULL,
  source_url text NOT NULL,
  duration_text text,
  pickup_zone text,
  blurb text,
  inclusions text[] NOT NULL DEFAULT '{}'::text[],
  exclusions text[] NOT NULL DEFAULT '{}'::text[],
  varies_by_option text[] NOT NULL DEFAULT '{}'::text[],
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.builder_tour_sources ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read tour_sources" ON public.builder_tour_sources;
CREATE POLICY "Anyone can read tour_sources" ON public.builder_tour_sources FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins manage tour_sources insert" ON public.builder_tour_sources;
CREATE POLICY "Admins manage tour_sources insert" ON public.builder_tour_sources FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
DROP POLICY IF EXISTS "Admins manage tour_sources update" ON public.builder_tour_sources;
CREATE POLICY "Admins manage tour_sources update" ON public.builder_tour_sources FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
DROP POLICY IF EXISTS "Admins manage tour_sources delete" ON public.builder_tour_sources;
CREATE POLICY "Admins manage tour_sources delete" ON public.builder_tour_sources FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- 3. Tour ↔ Stop mapping
CREATE TABLE IF NOT EXISTS public.builder_tour_stops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_key text NOT NULL,
  stop_canonical text NOT NULL,
  variant_bucket text NOT NULL,
  duration_minutes integer NOT NULL,
  optional boolean NOT NULL DEFAULT false,
  position integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(tour_key, stop_canonical, variant_bucket)
);
CREATE INDEX IF NOT EXISTS builder_tour_stops_tour_idx ON public.builder_tour_stops(tour_key);
CREATE INDEX IF NOT EXISTS builder_tour_stops_stop_idx ON public.builder_tour_stops(stop_canonical);
ALTER TABLE public.builder_tour_stops ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read tour_stops" ON public.builder_tour_stops;
CREATE POLICY "Anyone can read tour_stops" ON public.builder_tour_stops FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins manage tour_stops insert" ON public.builder_tour_stops;
CREATE POLICY "Admins manage tour_stops insert" ON public.builder_tour_stops FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
DROP POLICY IF EXISTS "Admins manage tour_stops update" ON public.builder_tour_stops;
CREATE POLICY "Admins manage tour_stops update" ON public.builder_tour_stops FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
DROP POLICY IF EXISTS "Admins manage tour_stops delete" ON public.builder_tour_stops;
CREATE POLICY "Admins manage tour_stops delete" ON public.builder_tour_stops FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- 4. Compatibility
CREATE TABLE IF NOT EXISTS public.builder_compatibility_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stop_a text NOT NULL,
  stop_b text NOT NULL,
  cooccurrence_count integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(stop_a, stop_b)
);
CREATE INDEX IF NOT EXISTS builder_compat_a_idx ON public.builder_compatibility_rules(stop_a);
CREATE INDEX IF NOT EXISTS builder_compat_b_idx ON public.builder_compatibility_rules(stop_b);
ALTER TABLE public.builder_compatibility_rules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read compatibility" ON public.builder_compatibility_rules;
CREATE POLICY "Anyone can read compatibility" ON public.builder_compatibility_rules FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins manage compatibility insert" ON public.builder_compatibility_rules;
CREATE POLICY "Admins manage compatibility insert" ON public.builder_compatibility_rules FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
DROP POLICY IF EXISTS "Admins manage compatibility update" ON public.builder_compatibility_rules;
CREATE POLICY "Admins manage compatibility update" ON public.builder_compatibility_rules FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
DROP POLICY IF EXISTS "Admins manage compatibility delete" ON public.builder_compatibility_rules;
CREATE POLICY "Admins manage compatibility delete" ON public.builder_compatibility_rules FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

DROP TRIGGER IF EXISTS set_updated_at_tour_sources ON public.builder_tour_sources;
CREATE TRIGGER set_updated_at_tour_sources BEFORE UPDATE ON public.builder_tour_sources FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 5. Seed operational regions
INSERT INTO public.builder_regions (key,label,blurb,lat,lng,sort_order) VALUES
  ('arrabida-setubal','Arrábida & Setúbal','Cliffs, oyster beaches, and Portugal''s wine cellars an hour from Lisbon.',38.49,-8.95,1),
  ('troia-comporta','Tróia & Comporta','Roman ruins, palafitic piers, and rice paddies on the Sado peninsula.',38.40,-8.79,2),
  ('sintra-cascais','Sintra & Cascais','Romantic palaces, Atlantic capes, and the westernmost point of Europe.',38.78,-9.40,3),
  ('evora-alentejo','Évora & Alentejo','Roman temples, cork forests, and Alentejo''s slow wine country.',38.57,-7.91,4),
  ('centro-tomar-coimbra','Tomar & Coimbra','Templar heritage and Portugal''s oldest university north of Lisbon.',39.90,-8.42,5),
  ('centro-fatima-nazare-obidos','Fátima, Nazaré & Óbidos','Sanctuary, giant Atlantic waves, and a walled medieval village.',39.53,-9.07,6)
ON CONFLICT (key) DO UPDATE SET
  label=EXCLUDED.label,
  blurb=EXCLUDED.blurb,
  lat=EXCLUDED.lat,
  lng=EXCLUDED.lng,
  sort_order=EXCLUDED.sort_order;