
-- ============================================================
-- BUILDER REGIONS
-- ============================================================
CREATE TABLE public.builder_regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  blurb TEXT,
  lat NUMERIC(9,6) NOT NULL,
  lng NUMERIC(9,6) NOT NULL,
  hero_image_url TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.builder_regions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read builder_regions"
  ON public.builder_regions FOR SELECT
  TO anon, authenticated USING (true);
CREATE POLICY "Admins manage builder_regions insert"
  ON public.builder_regions FOR INSERT
  TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage builder_regions update"
  ON public.builder_regions FOR UPDATE
  TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage builder_regions delete"
  ON public.builder_regions FOR DELETE
  TO authenticated USING (has_role(auth.uid(), 'admin'));

CREATE TRIGGER tg_builder_regions_updated_at BEFORE UPDATE ON public.builder_regions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- BUILDER STOPS
-- ============================================================
CREATE TABLE public.builder_stops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  region_key TEXT NOT NULL REFERENCES public.builder_regions(key) ON DELETE CASCADE,
  label TEXT NOT NULL,
  blurb TEXT,
  tag TEXT,
  lat NUMERIC(9,6) NOT NULL,
  lng NUMERIC(9,6) NOT NULL,
  duration_minutes INT NOT NULL DEFAULT 60,
  -- affinities used by the logic engine to score candidates
  mood_tags TEXT[] NOT NULL DEFAULT '{}',          -- e.g. {slow, romantic, energetic}
  pace_tags TEXT[] NOT NULL DEFAULT '{}',          -- {relaxed, balanced, full}
  intention_tags TEXT[] NOT NULL DEFAULT '{}',     -- {wine, gastronomy, nature, heritage, coast, hidden}
  who_tags TEXT[] NOT NULL DEFAULT '{}',           -- {couple, family, friends, solo}
  -- compatibility hint: stop keys that pair particularly well
  compatible_with TEXT[] NOT NULL DEFAULT '{}',
  open_from TIME,
  open_to TIME,
  image_url TEXT,
  weight INT NOT NULL DEFAULT 50,                  -- higher = more likely to anchor a day
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.builder_stops ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_builder_stops_region ON public.builder_stops(region_key);
CREATE INDEX idx_builder_stops_active ON public.builder_stops(is_active) WHERE is_active;

CREATE POLICY "Anyone can read builder_stops"
  ON public.builder_stops FOR SELECT
  TO anon, authenticated USING (true);
CREATE POLICY "Admins manage builder_stops insert"
  ON public.builder_stops FOR INSERT
  TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage builder_stops update"
  ON public.builder_stops FOR UPDATE
  TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage builder_stops delete"
  ON public.builder_stops FOR DELETE
  TO authenticated USING (has_role(auth.uid(), 'admin'));

CREATE TRIGGER tg_builder_stops_updated_at BEFORE UPDATE ON public.builder_stops
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- BUILDER EXPERIENCE TYPES
-- ============================================================
CREATE TABLE public.builder_experience_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  blurb TEXT,
  default_pace TEXT NOT NULL DEFAULT 'balanced',
  default_mood TEXT NOT NULL DEFAULT 'slow',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.builder_experience_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read builder_experience_types"
  ON public.builder_experience_types FOR SELECT
  TO anon, authenticated USING (true);
CREATE POLICY "Admins manage builder_experience_types insert"
  ON public.builder_experience_types FOR INSERT
  TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage builder_experience_types update"
  ON public.builder_experience_types FOR UPDATE
  TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage builder_experience_types delete"
  ON public.builder_experience_types FOR DELETE
  TO authenticated USING (has_role(auth.uid(), 'admin'));

CREATE TRIGGER tg_builder_experience_types_updated_at BEFORE UPDATE ON public.builder_experience_types
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- BUILDER ROUTING RULES (single-row config)
-- ============================================================
CREATE TABLE public.builder_routing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  max_experience_hours NUMERIC(4,2) NOT NULL DEFAULT 8.0,
  max_driving_hours NUMERIC(4,2) NOT NULL DEFAULT 3.0,
  min_stops INT NOT NULL DEFAULT 3,
  max_stops INT NOT NULL DEFAULT 6,
  default_pace TEXT NOT NULL DEFAULT 'balanced',
  base_price_per_person_eur INT NOT NULL DEFAULT 180,
  pace_multiplier_relaxed NUMERIC(4,2) NOT NULL DEFAULT 0.85,
  pace_multiplier_balanced NUMERIC(4,2) NOT NULL DEFAULT 1.00,
  pace_multiplier_full NUMERIC(4,2) NOT NULL DEFAULT 1.20,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.builder_routing_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read builder_routing_rules"
  ON public.builder_routing_rules FOR SELECT
  TO anon, authenticated USING (true);
CREATE POLICY "Admins manage builder_routing_rules insert"
  ON public.builder_routing_rules FOR INSERT
  TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage builder_routing_rules update"
  ON public.builder_routing_rules FOR UPDATE
  TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage builder_routing_rules delete"
  ON public.builder_routing_rules FOR DELETE
  TO authenticated USING (has_role(auth.uid(), 'admin'));

CREATE TRIGGER tg_builder_routing_rules_updated_at BEFORE UPDATE ON public.builder_routing_rules
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- SEED: regions
-- ============================================================
INSERT INTO public.builder_regions (key, label, blurb, lat, lng, sort_order) VALUES
  ('lisbon', 'Lisbon & Coast', 'The capital, Sintra''s palaces, the Arrábida coast and Setúbal''s wine country.', 38.7223, -9.1393, 1),
  ('porto', 'Porto & Douro', 'Riverside Porto, the Douro Valley terraces, port cellars and granite villages.', 41.1579, -8.6291, 2),
  ('alentejo', 'Alentejo & Centro', 'Évora, Monsaraz, cork plains, slow vineyards and the inland heart of Portugal.', 38.5713, -7.9135, 3),
  ('algarve', 'Algarve', 'Golden cliffs, hidden coves, Ria Formosa, Vicentine wild coast and Monchique hills.', 37.0194, -7.9304, 4);

-- ============================================================
-- SEED: experience types
-- ============================================================
INSERT INTO public.builder_experience_types (key, label, blurb, default_pace, default_mood, sort_order) VALUES
  ('slow_sensory', 'Slow & sensory', 'Long lunches, vineyards, viewpoints. Time becomes the luxury.', 'relaxed', 'slow', 1),
  ('wine_gastronomy', 'Wine & gastronomy', 'Cellars, markets, chef tables, family producers. Taste the country.', 'balanced', 'curious', 2),
  ('coast_nature', 'Coast & nature', 'Cliffs, boats, hidden beaches, natural parks. Sea air, real distance.', 'balanced', 'open', 3),
  ('heritage_wonder', 'Heritage & wonder', 'Palaces, monasteries, old towns, the layers of a long story.', 'balanced', 'curious', 4);

-- ============================================================
-- SEED: routing rules
-- ============================================================
INSERT INTO public.builder_routing_rules (max_experience_hours, max_driving_hours, min_stops, max_stops, default_pace, base_price_per_person_eur)
VALUES (8.0, 3.0, 3, 6, 'balanced', 180);

-- ============================================================
-- SEED: stops (curated, real coordinates)
-- ============================================================

-- LISBON & COAST
INSERT INTO public.builder_stops (key, region_key, label, blurb, tag, lat, lng, duration_minutes, mood_tags, pace_tags, intention_tags, who_tags, weight) VALUES
  ('lisbon_alfama', 'lisbon', 'Alfama, Lisbon', 'The oldest quarter — tiled facades, fado echoes, river views from Santa Luzia.', 'Old town', 38.7110, -9.1300, 90, ARRAY['slow','romantic','curious'], ARRAY['relaxed','balanced'], ARRAY['heritage','hidden'], ARRAY['couple','solo','family'], 80),
  ('sintra_pena', 'lisbon', 'Pena Palace, Sintra', 'Romantic mountaintop palace, painted in ochre and lichen-green.', 'Heritage', 38.7878, -9.3905, 120, ARRAY['curious','romantic'], ARRAY['balanced','full'], ARRAY['heritage','wonder'], ARRAY['couple','family'], 90),
  ('cabo_da_roca', 'lisbon', 'Cabo da Roca', 'The westernmost point of continental Europe — wind, cliffs, ocean.', 'Coast', 38.7805, -9.4989, 45, ARRAY['open','romantic'], ARRAY['relaxed','balanced'], ARRAY['nature','coast'], ARRAY['couple','solo','friends'], 70),
  ('cascais_old_town', 'lisbon', 'Cascais old town', 'Fishermen-turned-royal-resort. Cobbled lanes, sardines, slow coffee.', 'Coast', 38.6979, -9.4215, 75, ARRAY['slow','open'], ARRAY['relaxed','balanced'], ARRAY['coast','gastronomy'], ARRAY['couple','family','friends'], 65),
  ('azeitao_winery', 'lisbon', 'Azeitão winery', 'Family wineries between Setúbal hills — moscatel, cheese, terraced vines.', 'Wine', 38.5167, -9.0167, 90, ARRAY['slow','curious'], ARRAY['relaxed','balanced'], ARRAY['wine','gastronomy'], ARRAY['couple','friends'], 80),
  ('livramento_market', 'lisbon', 'Livramento Market, Setúbal', 'Tiled fish market — choose, taste, talk to the producers.', 'Market', 38.5249, -8.8920, 60, ARRAY['curious','open'], ARRAY['balanced','full'], ARRAY['gastronomy','hidden'], ARRAY['couple','friends','family'], 65),
  ('arrabida_park', 'lisbon', 'Arrábida Natural Park', 'Pine, limestone cliffs, turquoise water — one of the country''s prettiest drives.', 'Nature', 38.4833, -8.9833, 90, ARRAY['open','romantic'], ARRAY['balanced'], ARRAY['nature','coast'], ARRAY['couple','family','friends'], 75),
  ('portinho_arrabida', 'lisbon', 'Portinho da Arrábida', 'A near-secret cove, calm water, a lunch by the sea.', 'Coast', 38.4833, -8.9333, 90, ARRAY['slow','romantic'], ARRAY['relaxed','balanced'], ARRAY['coast','hidden','gastronomy'], ARRAY['couple','family'], 70),
  ('sesimbra_fishing', 'lisbon', 'Sesimbra fishing village', 'Whitewashed harbour, grilled fish on the boardwalk.', 'Coast', 38.4444, -9.1019, 75, ARRAY['slow','open'], ARRAY['relaxed','balanced'], ARRAY['coast','gastronomy'], ARRAY['couple','family','friends'], 60),
  ('cristo_rei_view', 'lisbon', 'Cristo Rei viewpoint', 'The whole city laid across the Tagus, from the south bank.', 'Viewpoint', 38.6781, -9.1721, 30, ARRAY['open','romantic'], ARRAY['relaxed','balanced','full'], ARRAY['heritage','hidden'], ARRAY['couple','solo'], 50);

-- PORTO & DOURO
INSERT INTO public.builder_stops (key, region_key, label, blurb, tag, lat, lng, duration_minutes, mood_tags, pace_tags, intention_tags, who_tags, weight) VALUES
  ('porto_ribeira', 'porto', 'Ribeira, Porto', 'Tiered houses on the Douro, the heart of the old city.', 'Old town', 41.1408, -8.6133, 90, ARRAY['slow','curious'], ARRAY['relaxed','balanced'], ARRAY['heritage','hidden'], ARRAY['couple','family','friends'], 80),
  ('gaia_cellars', 'porto', 'Vila Nova de Gaia port cellars', 'Walk under the bridge into a 200-year-old port lodge.', 'Wine', 41.1339, -8.6111, 90, ARRAY['curious'], ARRAY['balanced','full'], ARRAY['wine','heritage'], ARRAY['couple','friends'], 85),
  ('douro_valley_terraces', 'porto', 'Douro Valley terraces', 'Vines on schist, the river bending below — the original wine landscape.', 'Wine', 41.1750, -7.7889, 150, ARRAY['slow','romantic','open'], ARRAY['relaxed','balanced'], ARRAY['wine','nature'], ARRAY['couple','friends'], 95),
  ('pinhao_river', 'porto', 'Pinhão river station', 'Tiled rail station, river boats, a long lunch above the vines.', 'River', 41.1900, -7.5450, 90, ARRAY['slow'], ARRAY['relaxed'], ARRAY['wine','heritage'], ARRAY['couple','family'], 75),
  ('guimaraes_old', 'porto', 'Guimarães old town', 'Where Portugal was born — granite walls, narrow streets.', 'Heritage', 41.4419, -8.2919, 90, ARRAY['curious'], ARRAY['balanced'], ARRAY['heritage'], ARRAY['couple','family','friends'], 65),
  ('braga_bom_jesus', 'porto', 'Bom Jesus do Monte', 'Baroque stairway climbing through gardens to a hilltop sanctuary.', 'Sanctuary', 41.5547, -8.3772, 75, ARRAY['curious','romantic'], ARRAY['balanced'], ARRAY['heritage','wonder'], ARRAY['couple','family'], 60);

-- ALENTEJO & CENTRO
INSERT INTO public.builder_stops (key, region_key, label, blurb, tag, lat, lng, duration_minutes, mood_tags, pace_tags, intention_tags, who_tags, weight) VALUES
  ('evora_old', 'alentejo', 'Évora old town', 'Roman temple, whitewashed walls, a slow Alentejo afternoon.', 'Heritage', 38.5713, -7.9135, 120, ARRAY['slow','curious'], ARRAY['relaxed','balanced'], ARRAY['heritage','wonder'], ARRAY['couple','family','friends'], 85),
  ('monsaraz_village', 'alentejo', 'Monsaraz', 'Hilltop medieval village above the lake — silence and long horizons.', 'Quiet', 38.4436, -7.3811, 90, ARRAY['slow','romantic'], ARRAY['relaxed'], ARRAY['heritage','hidden'], ARRAY['couple','solo'], 80),
  ('alentejo_winery', 'alentejo', 'Alentejo winery lunch', 'Family estate, talha wines, lunch under the cork trees.', 'Wine', 38.6500, -7.6000, 150, ARRAY['slow','curious'], ARRAY['relaxed','balanced'], ARRAY['wine','gastronomy'], ARRAY['couple','friends'], 85),
  ('comporta_dunes', 'alentejo', 'Comporta dunes', 'Rice fields meeting white sand — Portugal''s quiet luxury coast.', 'Coast', 38.3878, -8.7862, 90, ARRAY['slow','romantic','open'], ARRAY['relaxed'], ARRAY['coast','nature','hidden'], ARRAY['couple','family'], 70),
  ('obidos_walls', 'alentejo', 'Óbidos walled town', 'Bougainvillea, narrow lanes, ginjinha in chocolate cups.', 'Medieval', 39.3606, -9.1571, 75, ARRAY['curious','romantic'], ARRAY['balanced'], ARRAY['heritage'], ARRAY['couple','family'], 65),
  ('nazare_cliffs', 'alentejo', 'Nazaré cliffs', 'The headland above big-wave beach — wind, salt, fishermen''s stories.', 'Coast', 39.6010, -9.0707, 60, ARRAY['open'], ARRAY['balanced'], ARRAY['coast','nature'], ARRAY['couple','family','friends'], 55);

-- ALGARVE
INSERT INTO public.builder_stops (key, region_key, label, blurb, tag, lat, lng, duration_minutes, mood_tags, pace_tags, intention_tags, who_tags, weight) VALUES
  ('benagil_caves', 'algarve', 'Benagil sea caves', 'Cathedral of light cut into the cliff — best from the water.', 'Boat', 37.0867, -8.4258, 90, ARRAY['curious','open','romantic'], ARRAY['balanced','full'], ARRAY['coast','nature','wonder'], ARRAY['couple','family','friends'], 90),
  ('lagos_old_town', 'algarve', 'Lagos old town', 'Whitewashed walls, a working harbour, the cliffs five minutes away.', 'Coast', 37.1028, -8.6741, 75, ARRAY['slow','open'], ARRAY['relaxed','balanced'], ARRAY['coast','heritage'], ARRAY['couple','family'], 70),
  ('vicentine_coast', 'algarve', 'Vicentine wild coast', 'Atlantic cliffs, surfers, ash-grey beaches — the untamed Algarve.', 'Wild coast', 37.2000, -8.8000, 120, ARRAY['open','curious'], ARRAY['balanced'], ARRAY['nature','coast','hidden'], ARRAY['couple','friends'], 75),
  ('ria_formosa', 'algarve', 'Ria Formosa lagoon', 'Sandbar islands, oyster beds, flamingos in the channels.', 'Nature', 37.0167, -7.8500, 120, ARRAY['slow','open'], ARRAY['relaxed','balanced'], ARRAY['nature','gastronomy'], ARRAY['couple','family'], 75),
  ('monchique_hills', 'algarve', 'Monchique hills', 'Cork forests, eucalyptus, mountain spas above the coast.', 'Mountain', 37.3175, -8.5536, 90, ARRAY['slow'], ARRAY['relaxed','balanced'], ARRAY['nature','wellness'], ARRAY['couple','solo'], 55),
  ('tavira_lanes', 'algarve', 'Tavira lanes', 'A different Algarve — Moorish bridge, tiled roofs, no rush.', 'Quiet', 37.1273, -7.6506, 75, ARRAY['slow'], ARRAY['relaxed'], ARRAY['heritage','hidden'], ARRAY['couple','solo','family'], 60);
