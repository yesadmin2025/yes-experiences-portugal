-- Roles enum + table
create type public.app_role as enum ('admin', 'moderator', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

create policy "Admins can read all user_roles"
  on public.user_roles for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "Users can read their own roles"
  on public.user_roles for select
  to authenticated
  using (user_id = auth.uid());

create policy "Admins can insert user_roles"
  on public.user_roles for insert
  to authenticated
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins can update user_roles"
  on public.user_roles for update
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can delete user_roles"
  on public.user_roles for delete
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- Imported tours
create table public.imported_tours (
  id text primary key,                    -- slug derived from source URL
  title text not null,
  source_url text not null unique,
  region text not null,                   -- builder region id (lisbon, porto, alentejo, algarve)
  region_label text not null,             -- display label
  duration text not null,                 -- builder duration id (halfday, fullday, twoday, ...)
  duration_label text not null,
  duration_hours text not null,           -- "8–9h"
  price_from integer not null,
  theme text not null,
  styles text[] not null default '{}',
  highlights text[] not null default '{}',
  pace text not null,
  tier text not null,
  fits_best text not null,
  pace_cues text[] not null default '{}',
  blurb text not null,
  image_url text,
  stops jsonb not null default '[]'::jsonb, -- [{label,tag,x,y}, ...]
  ai_model text,
  imported_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.imported_tours enable row level security;

create policy "Anyone can read imported tours"
  on public.imported_tours for select
  to anon, authenticated
  using (true);

create policy "Admins can insert imported tours"
  on public.imported_tours for insert
  to authenticated
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins can update imported tours"
  on public.imported_tours for update
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can delete imported tours"
  on public.imported_tours for delete
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger imported_tours_set_updated_at
  before update on public.imported_tours
  for each row execute function public.set_updated_at();

-- Importer audit log
create table public.import_runs (
  id uuid primary key default gen_random_uuid(),
  ran_by uuid references auth.users(id) on delete set null,
  status text not null,             -- 'success' | 'partial' | 'failed'
  tours_imported integer not null default 0,
  tours_failed integer not null default 0,
  error text,
  created_at timestamptz not null default now()
);

alter table public.import_runs enable row level security;

create policy "Admins can read import runs"
  on public.import_runs for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can insert import runs"
  on public.import_runs for insert
  to authenticated
  with check (public.has_role(auth.uid(), 'admin'));