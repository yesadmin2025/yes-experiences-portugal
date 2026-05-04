-- 1. Drop permissive table policy on builder_reference_uploads.
--    Replaced by `deleteBuilderReference` server function (admin client).
DROP POLICY IF EXISTS "Anyone can delete their session reference uploads"
  ON public.builder_reference_uploads;

-- 2. Drop permissive storage.objects policies on the builder-references bucket.
--    Listing is no longer allowed; file fetches via public URL keep working
--    (public-bucket downloads bypass storage.objects SELECT RLS). Deletes
--    now route through the server function using the service role key.
DROP POLICY IF EXISTS "Anyone can read builder reference files"
  ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete files in their builder session folder"
  ON storage.objects;

-- 3. Lock down the SECURITY DEFINER cleanup helper so only the backend
--    service role can call it. Signed-in (or anon) clients have no reason
--    to invoke it directly.
REVOKE EXECUTE ON FUNCTION public.cleanup_expired_builder_references()
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_expired_builder_references()
  TO service_role;
