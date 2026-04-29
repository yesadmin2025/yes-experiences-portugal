-- Booking type enum
create type public.booking_type as enum ('tailored', 'builder', 'multi-day', 'signature');

-- Booking status enum
create type public.booking_status as enum ('pending', 'paid', 'cancelled', 'refunded', 'failed');

-- Bookings table
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),

  booking_type public.booking_type not null,
  source_tour_id text,
  source_journey_id text,

  customer_email text not null,
  customer_name text,
  customer_phone text,

  guests integer not null default 1 check (guests >= 1 and guests <= 50),
  preferred_date date,
  notes text,

  amount_total integer not null check (amount_total >= 0),
  currency text not null default 'eur',

  status public.booking_status not null default 'pending',

  stripe_session_id text unique,
  stripe_payment_intent_id text unique,

  metadata jsonb not null default '{}'::jsonb
);

create index bookings_customer_email_idx on public.bookings (lower(customer_email));
create index bookings_status_idx on public.bookings (status);
create index bookings_created_at_idx on public.bookings (created_at desc);

-- Updated_at trigger (function already exists from earlier migrations)
create trigger bookings_set_updated_at
  before update on public.bookings
  for each row execute function public.set_updated_at();

-- RLS
alter table public.bookings enable row level security;

create policy "Admins can read all bookings"
  on public.bookings for select to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can insert bookings"
  on public.bookings for insert to authenticated
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins can update bookings"
  on public.bookings for update to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can delete bookings"
  on public.bookings for delete to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- Authenticated users can read their own bookings (matched by email on their auth row)
create policy "Users can read their own bookings"
  on public.bookings for select to authenticated
  using (
    lower(customer_email) = lower(coalesce(
      (auth.jwt() ->> 'email'),
      ''
    ))
  );