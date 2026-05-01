-- Ensure required extensions
create extension if not exists pg_cron;

-- Cleanup function: deletes storage objects + DB rows for expired builder reference uploads
create or replace function public.cleanup_expired_builder_references()
returns integer
language plpgsql
security definer
set search_path = public, storage
as $$
declare
  deleted_count integer := 0;
begin
  -- Delete the underlying storage objects for expired uploads
  delete from storage.objects o
  using public.builder_reference_uploads u
  where o.bucket_id = 'builder-references'
    and o.name = u.file_path
    and u.expires_at < now();

  -- Delete the expired DB rows
  with del as (
    delete from public.builder_reference_uploads
    where expires_at < now()
    returning 1
  )
  select count(*) into deleted_count from del;

  return deleted_count;
end;
$$;

-- Restrict execution to service role / definer (no anon execution)
revoke all on function public.cleanup_expired_builder_references() from public, anon, authenticated;

-- Unschedule prior version if it exists, then schedule daily at 03:00 UTC
do $$
begin
  if exists (select 1 from cron.job where jobname = 'cleanup-builder-references-daily') then
    perform cron.unschedule('cleanup-builder-references-daily');
  end if;
end
$$;

select cron.schedule(
  'cleanup-builder-references-daily',
  '0 3 * * *',
  $$ select public.cleanup_expired_builder_references(); $$
);