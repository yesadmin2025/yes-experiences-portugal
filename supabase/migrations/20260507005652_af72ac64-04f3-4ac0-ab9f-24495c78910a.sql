
-- 1. Bookings: replace email-claim policy with verified-email check
DROP POLICY IF EXISTS "Users can read their own bookings" ON public.bookings;
CREATE POLICY "Verified users can read their own bookings"
ON public.bookings
FOR SELECT
TO authenticated
USING (
  COALESCE((auth.jwt() ->> 'email_verified')::boolean, false) = true
  AND lower(customer_email) = lower(COALESCE(auth.jwt() ->> 'email', ''))
);

-- 2. builder_reference_uploads: restrict SELECT to admin only (server uses service role)
DROP POLICY IF EXISTS "Anyone can read builder reference uploads" ON public.builder_reference_uploads;
CREATE POLICY "Admins can read builder reference uploads"
ON public.builder_reference_uploads
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- 3. builder_routing_rules: hide pricing/routing config from public
DROP POLICY IF EXISTS "Anyone can read builder_routing_rules" ON public.builder_routing_rules;
CREATE POLICY "Admins can read builder_routing_rules"
ON public.builder_routing_rules
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- 4. Make builder-references bucket private; tighten storage policies
UPDATE storage.buckets SET public = false WHERE id = 'builder-references';

DROP POLICY IF EXISTS "Anyone can upload builder references" ON storage.objects;
DROP POLICY IF EXISTS "Public read builder references" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can read builder references" ON storage.objects;

CREATE POLICY "Anon can upload builder references"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'builder-references');

CREATE POLICY "Admins can read builder references"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'builder-references' AND has_role(auth.uid(), 'admin'::app_role));
