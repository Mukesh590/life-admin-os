-- Life AdminOS productivity features.
-- Additive only: this migration does not modify or delete existing user data.

create table if not exists public.quick_inbox_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 160),
  note text check (note is null or char_length(note) <= 1000),
  category text,
  due_date date,
  state text not null default 'inbox' check (state in ('inbox', 'processed')),
  processed_into_type text check (
    processed_into_type is null or
    processed_into_type in ('deadline', 'bill', 'document', 'subscription', 'appointment', 'warranty')
  ),
  processed_into_id uuid,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists quick_inbox_items_user_state_created_idx
  on public.quick_inbox_items (user_id, state, created_at desc);
create index if not exists quick_inbox_items_user_due_idx
  on public.quick_inbox_items (user_id, due_date)
  where due_date is not null;

create table if not exists public.category_budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null check (char_length(btrim(category)) between 1 and 80),
  month_start date not null check (month_start = date_trunc('month', month_start)::date),
  monthly_cap numeric(12,2) not null check (monthly_cap >= 0),
  rollover_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, category, month_start)
);

create index if not exists category_budgets_user_month_idx
  on public.category_budgets (user_id, month_start desc);

create table if not exists public.weekly_focus_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start date not null,
  focus_text text not null check (char_length(btrim(focus_text)) between 1 and 120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, week_start)
);

create index if not exists weekly_focus_notes_user_week_idx
  on public.weekly_focus_notes (user_id, week_start desc);

create table if not exists public.item_completion_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_type text not null check (
    item_type in ('deadline', 'bill', 'subscription', 'appointment', 'warranty', 'inbox')
  ),
  item_id uuid not null,
  occurrence_date date not null,
  due_at timestamptz,
  completed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, item_type, item_id, occurrence_date)
);

create index if not exists item_completion_events_user_completed_idx
  on public.item_completion_events (user_id, completed_at desc);
create index if not exists item_completion_events_user_item_occurrence_idx
  on public.item_completion_events (user_id, item_type, item_id, occurrence_date desc);

create table if not exists public.item_activity_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_type text not null check (
    item_type in ('deadline', 'bill', 'subscription', 'appointment', 'warranty', 'inbox')
  ),
  item_id uuid not null,
  event_type text not null check (event_type in ('postponed', 'workflow_status_changed')),
  from_due_at timestamptz,
  to_due_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists item_activity_events_user_created_idx
  on public.item_activity_events (user_id, created_at desc);
create index if not exists item_activity_events_user_item_type_idx
  on public.item_activity_events (user_id, item_type, item_id, event_type);

create table if not exists public.weekly_report_cache (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start date not null,
  report_text text not null check (char_length(report_text) between 1 and 8000),
  source_snapshot jsonb not null default '{}'::jsonb,
  generated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, week_start)
);

create index if not exists weekly_report_cache_user_week_idx
  on public.weekly_report_cache (user_id, week_start desc);

alter table public.quick_inbox_items enable row level security;
alter table public.category_budgets enable row level security;
alter table public.weekly_focus_notes enable row level security;
alter table public.item_completion_events enable row level security;
alter table public.item_activity_events enable row level security;
alter table public.weekly_report_cache enable row level security;

create policy "quick_inbox_items_select_own" on public.quick_inbox_items
  for select using (auth.uid() = user_id);
create policy "quick_inbox_items_insert_own" on public.quick_inbox_items
  for insert with check (auth.uid() = user_id);
create policy "quick_inbox_items_update_own" on public.quick_inbox_items
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "quick_inbox_items_delete_own" on public.quick_inbox_items
  for delete using (auth.uid() = user_id);

create policy "category_budgets_select_own" on public.category_budgets
  for select using (auth.uid() = user_id);
create policy "category_budgets_insert_own" on public.category_budgets
  for insert with check (auth.uid() = user_id);
create policy "category_budgets_update_own" on public.category_budgets
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "category_budgets_delete_own" on public.category_budgets
  for delete using (auth.uid() = user_id);

create policy "weekly_focus_notes_select_own" on public.weekly_focus_notes
  for select using (auth.uid() = user_id);
create policy "weekly_focus_notes_insert_own" on public.weekly_focus_notes
  for insert with check (auth.uid() = user_id);
create policy "weekly_focus_notes_update_own" on public.weekly_focus_notes
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "weekly_focus_notes_delete_own" on public.weekly_focus_notes
  for delete using (auth.uid() = user_id);

create policy "item_completion_events_select_own" on public.item_completion_events
  for select using (auth.uid() = user_id);
create policy "item_completion_events_insert_own" on public.item_completion_events
  for insert with check (auth.uid() = user_id);
create policy "item_completion_events_update_own" on public.item_completion_events
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "item_completion_events_delete_own" on public.item_completion_events
  for delete using (auth.uid() = user_id);

create policy "item_activity_events_select_own" on public.item_activity_events
  for select using (auth.uid() = user_id);
create policy "item_activity_events_insert_own" on public.item_activity_events
  for insert with check (auth.uid() = user_id);
create policy "item_activity_events_update_own" on public.item_activity_events
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "item_activity_events_delete_own" on public.item_activity_events
  for delete using (auth.uid() = user_id);

create policy "weekly_report_cache_select_own" on public.weekly_report_cache
  for select using (auth.uid() = user_id);
create policy "weekly_report_cache_insert_own" on public.weekly_report_cache
  for insert with check (auth.uid() = user_id);
create policy "weekly_report_cache_update_own" on public.weekly_report_cache
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "weekly_report_cache_delete_own" on public.weekly_report_cache
  for delete using (auth.uid() = user_id);

