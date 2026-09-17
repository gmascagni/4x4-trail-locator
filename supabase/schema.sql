-- ====================================================================
-- 4x4 TRAILFINDER: GROUP RUNS & TRIP SCHEDULER SCHEMA
-- PostgreSQL Schema with Row-Level Security (RLS) & Realtime Support
-- ====================================================================

-- 1. PROFILES TABLE (Linked to Supabase Auth)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null default 'Trail Explorer',
  avatar_url text,
  default_rig text default 'Jeep 4x4',
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- Trigger to automatically create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'Trail Driver'),
    coalesce(new.raw_user_meta_data->>'avatar_url', null)
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. TRIPS / EVENT MODEL TABLE
create table if not exists public.trips (
  id uuid default gen_random_uuid() primary key,
  trail_id text not null,
  trail_name text not null,
  title text not null,
  description text,
  start_time timestamptz not null,
  end_time timestamptz,
  meeting_location text not null,
  meeting_point_coordinates jsonb default '{"lat": 0, "lng": 0}'::jsonb,
  organizer_id uuid references public.profiles(id) on delete cascade not null,
  max_rigs integer default 8 check (max_rigs > 0),
  difficulty_rating text check (difficulty_rating in ('Easy', 'Moderate', 'Hard', 'Extreme')),
  minimum_requirements text[] default array['Full-size spare', 'Rated recovery points', '33" Tires'],
  comms_channel text default 'GMRS Channel 16 / 462.575 MHz',
  status text default 'Upcoming' check (status in ('Upcoming', 'In Progress', 'Completed', 'Cancelled')),
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- 3. RSVP / CONVOY ROSTER TABLE
create table if not exists public.trip_participants (
  id uuid default gen_random_uuid() primary key,
  trip_id uuid references public.trips(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  rig_details jsonb not null default '{"year": 2024, "make": "Jeep", "model": "Wrangler Rubicon", "tire_size": 35, "has_winch": true}'::jsonb,
  role text default 'Participant' check (role in ('Host', 'Tail Gunner / Sweep', 'Participant', 'Waitlist')),
  status text default 'Going' check (status in ('Going', 'Maybe', 'Cancelled')),
  joined_at timestamptz default timezone('utc'::text, now()) not null,
  unique (trip_id, user_id)
);

-- 4. TRIP COLLABORATION & REAL-TIME CHAT TABLE
create table if not exists public.trip_messages (
  id uuid default gen_random_uuid() primary key,
  trip_id uuid references public.trips(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- 5. ENABLE ROW LEVEL SECURITY (RLS)
alter table public.profiles enable row level security;
alter table public.trips enable row level security;
alter table public.trip_participants enable row level security;
alter table public.trip_messages enable row level security;

-- 6. RLS POLICIES

-- Profiles policies
drop policy if exists "Profiles are viewable by everyone" on public.profiles;
create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- Trips policies
drop policy if exists "Trips are viewable by everyone" on public.trips;
create policy "Trips are viewable by everyone"
  on public.trips for select using (true);

drop policy if exists "Authenticated users can create trips" on public.trips;
create policy "Authenticated users can create trips"
  on public.trips for insert with check (auth.uid() = organizer_id);

drop policy if exists "Organizers can update their trips" on public.trips;
create policy "Organizers can update their trips"
  on public.trips for update using (auth.uid() = organizer_id);

drop policy if exists "Organizers can delete their trips" on public.trips;
create policy "Organizers can delete their trips"
  on public.trips for delete using (auth.uid() = organizer_id);

-- Trip Participants policies
drop policy if exists "Participants viewable by everyone" on public.trip_participants;
create policy "Participants viewable by everyone"
  on public.trip_participants for select using (true);

drop policy if exists "Authenticated users can RSVP" on public.trip_participants;
create policy "Authenticated users can RSVP"
  on public.trip_participants for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update their own RSVP" on public.trip_participants;
create policy "Users can update their own RSVP"
  on public.trip_participants for update using (
    auth.uid() = user_id or
    auth.uid() in (select organizer_id from public.trips where id = trip_id)
  );

drop policy if exists "Users can cancel their RSVP" on public.trip_participants;
create policy "Users can cancel their RSVP"
  on public.trip_participants for delete using (
    auth.uid() = user_id or
    auth.uid() in (select organizer_id from public.trips where id = trip_id)
  );

-- Trip Messages policies
drop policy if exists "Messages viewable by everyone" on public.trip_messages;
create policy "Messages viewable by everyone"
  on public.trip_messages for select using (true);

drop policy if exists "Authenticated users can post messages" on public.trip_messages;
create policy "Authenticated users can post messages"
  on public.trip_messages for insert with check (auth.uid() = user_id);

drop policy if exists "Users can delete own messages" on public.trip_messages;
create policy "Users can delete own messages"
  on public.trip_messages for delete using (auth.uid() = user_id);

-- 7. ENABLE REALTIME SUBSCRIPTIONS
do $$
begin
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'trips'
  ) then
    alter publication supabase_realtime add table public.trips;
  end if;

  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'trip_participants'
  ) then
    alter publication supabase_realtime add table public.trip_participants;
  end if;

  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'trip_messages'
  ) then
    alter publication supabase_realtime add table public.trip_messages;
  end if;
end $$;
