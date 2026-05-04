-- has_role is a SECURITY DEFINER helper used inside RLS policies. RLS
-- policy evaluation runs with elevated privileges and does NOT require
-- the calling role to hold EXECUTE on the function, so revoking from
-- anon/authenticated does not break any existing policy. Clients have
-- no reason to call has_role directly.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role)
  TO service_role;
