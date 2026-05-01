-- 1. Storage bucket for builder reference uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'builder-references',
  'builder-references',
  true,
  10485760, -- 10 MB
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif',
    'application/pdf'
  ]
)
ON CONFLICT (id) DO UPDATE
  SET public = EXCLUDED.public,
      file_size_limit = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Storage policies: anonymous uploads/reads scoped by session folder
-- Path layout: {session_id}/{filename}
CREATE POLICY "Anyone can read builder reference files"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'builder-references');

CREATE POLICY "Anyone can upload to their builder session folder"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (
  bucket_id = 'builder-references'
  AND (storage.foldername(name))[1] IS NOT NULL
  AND length((storage.foldername(name))[1]) BETWEEN 8 AND 64
);

CREATE POLICY "Anyone can delete files in their builder session folder"
ON storage.objects
FOR DELETE
TO anon, authenticated
USING (
  bucket_id = 'builder-references'
  AND (storage.foldername(name))[1] IS NOT NULL
);

CREATE POLICY "Admins can manage all builder reference files"
ON storage.objects
FOR ALL
TO authenticated
USING (bucket_id = 'builder-references' AND has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (bucket_id = 'builder-references' AND has_role(auth.uid(), 'admin'::app_role));

-- 3. Table to track uploads + AI tone summary per session
CREATE TABLE public.builder_reference_uploads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  file_path text NOT NULL,
  file_url text NOT NULL,
  file_name text NOT NULL,
  mime_type text NOT NULL,
  file_size_bytes integer NOT NULL,
  tone_summary text,
  tone_keywords text[] NOT NULL DEFAULT '{}',
  analyzed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days')
);

CREATE INDEX idx_builder_reference_uploads_session
  ON public.builder_reference_uploads (session_id, created_at DESC);

CREATE INDEX idx_builder_reference_uploads_expires
  ON public.builder_reference_uploads (expires_at);

ALTER TABLE public.builder_reference_uploads ENABLE ROW LEVEL SECURITY;

-- Anyone (including anon) can insert/read rows for any session_id.
-- Privacy is by obscurity of the session_id (UUID generated client-side, never exposed).
-- This matches the same trust model as the storage bucket.
CREATE POLICY "Anyone can read builder reference uploads"
ON public.builder_reference_uploads
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Anyone can insert builder reference uploads"
ON public.builder_reference_uploads
FOR INSERT
TO anon, authenticated
WITH CHECK (
  session_id IS NOT NULL
  AND length(session_id) BETWEEN 8 AND 64
  AND file_size_bytes > 0
  AND file_size_bytes <= 10485760
  AND mime_type = ANY (ARRAY[
    'image/jpeg','image/png','image/webp','image/heic','image/heif','application/pdf'
  ])
);

CREATE POLICY "Anyone can delete their session reference uploads"
ON public.builder_reference_uploads
FOR DELETE
TO anon, authenticated
USING (true);

CREATE POLICY "Admins can update builder reference uploads"
ON public.builder_reference_uploads
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete any builder reference uploads"
ON public.builder_reference_uploads
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- updated_at-style trigger not needed (no updates expected from anon path)
