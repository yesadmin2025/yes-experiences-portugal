-- Image library for the Experience Builder
CREATE TABLE IF NOT EXISTS public.experience_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  source_url text,
  title text,
  alt_text text NOT NULL,
  region_key text REFERENCES public.builder_regions(key) ON DELETE SET NULL,
  related_stop_key text REFERENCES public.builder_stops(key) ON DELETE SET NULL,
  related_tour_id text,
  image_type text NOT NULL DEFAULT 'landscape',
  usage_role text NOT NULL DEFAULT 'card',
  mood_tags text[] NOT NULL DEFAULT '{}',
  occasion_tags text[] NOT NULL DEFAULT '{}',
  priority_score integer NOT NULL DEFAULT 50,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (image_url)
);

CREATE INDEX IF NOT EXISTS idx_experience_images_stop ON public.experience_images(related_stop_key) WHERE is_active;
CREATE INDEX IF NOT EXISTS idx_experience_images_region ON public.experience_images(region_key) WHERE is_active;
CREATE INDEX IF NOT EXISTS idx_experience_images_role ON public.experience_images(usage_role) WHERE is_active;
CREATE INDEX IF NOT EXISTS idx_experience_images_mood ON public.experience_images USING GIN(mood_tags);
CREATE INDEX IF NOT EXISTS idx_experience_images_occasion ON public.experience_images USING GIN(occasion_tags);

ALTER TABLE public.experience_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active experience_images"
  ON public.experience_images FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can insert experience_images"
  ON public.experience_images FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update experience_images"
  ON public.experience_images FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete experience_images"
  ON public.experience_images FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER set_experience_images_updated_at
  BEFORE UPDATE ON public.experience_images
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();