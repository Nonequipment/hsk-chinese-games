create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  started_at timestamptz not null default now(),
  target_date date not null default date '2026-10-17',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.study_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  word_id text not null,
  set_id text not null,
  studied_at timestamptz not null default now(),
  review_count integer not null default 1 check (review_count > 0),
  last_mode text not null,
  primary key (user_id, word_id)
);

create table public.set_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  set_id text not null,
  studied_count integer not null default 0 check (studied_count >= 0),
  is_study_complete boolean not null default false,
  exam_unlocked_at timestamptz,
  passed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, set_id)
);

create table public.exam_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  set_id text not null,
  stage text not null check (stage in ('meaning', 'typing', 'tone')),
  score integer not null check (score >= 0),
  total integer not null check (total > 0),
  passed boolean not null,
  answers jsonb not null default '{}'::jsonb,
  completed_at timestamptz not null default now()
);

create index study_progress_user_set_idx on public.study_progress(user_id, set_id);
create index set_progress_user_updated_idx on public.set_progress(user_id, updated_at desc);
create index exam_attempts_user_set_idx on public.exam_attempts(user_id, set_id, completed_at desc);

alter table public.profiles enable row level security;
alter table public.study_progress enable row level security;
alter table public.set_progress enable row level security;
alter table public.exam_attempts enable row level security;

create policy "profiles owner access" on public.profiles for all to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "study progress owner access" on public.study_progress for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "set progress owner access" on public.set_progress for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "exam attempts owner access" on public.exam_attempts for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
