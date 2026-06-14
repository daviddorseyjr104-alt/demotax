-- ─────────────────────────────────────────────────────────────────────────────
-- Tax Strategy Operations Hub — Database Schema
-- Run this in: Supabase Dashboard → SQL Editor → Run
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Meetings ──────────────────────────────────────────────────────────────────
create table if not exists meetings (
  id              uuid        default gen_random_uuid() primary key,
  user_id         uuid        references auth.users(id) on delete cascade not null,
  notes           text        not null default '',
  clean_summary   text        default '',
  key_concerns    jsonb       default '[]'::jsonb,
  action_items    jsonb       default '[]'::jsonb,
  missing_info    jsonb       default '[]'::jsonb,
  follow_up_email text        default '',
  crm_task        text        default '',
  created_at      timestamptz default now()
);

alter table meetings enable row level security;

create policy "Users manage own meetings" on meetings
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists meetings_user_created
  on meetings(user_id, created_at desc);

-- ── Pipeline Leads ────────────────────────────────────────────────────────────
create table if not exists pipeline_leads (
  id           uuid        default gen_random_uuid() primary key,
  user_id      uuid        references auth.users(id) on delete cascade not null,
  name         text        not null,
  company      text        default '',
  category     text        default '',
  location     text        default '',
  tx_range     text        default '',
  deal_type    text        default '',
  source       text        default '',
  referred_by  text        default '',
  status       text        default 'New Lead',
  priority     integer     default 70,
  last_contact text        default 'Never',
  next_action  text        default '',
  notes        text        default '',
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

alter table pipeline_leads enable row level security;

create policy "Users manage own pipeline" on pipeline_leads
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists pipeline_leads_user_priority
  on pipeline_leads(user_id, priority desc);

-- ── Deals ─────────────────────────────────────────────────────────────────────
create table if not exists deals (
  id             uuid        default gen_random_uuid() primary key,
  user_id        uuid        references auth.users(id) on delete cascade not null,
  prospect_name  text        default '',
  asset_type     text        default '',
  sale_price     numeric     default 0,
  cost_basis     numeric     default 0,
  gross_gain     numeric     default 0,
  total_exposure numeric     default 0,
  deferrable_amt numeric     default 0,
  memo           text        default '',
  created_at     timestamptz default now()
);

alter table deals enable row level security;

create policy "Users manage own deals" on deals
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists deals_user_created
  on deals(user_id, created_at desc);
