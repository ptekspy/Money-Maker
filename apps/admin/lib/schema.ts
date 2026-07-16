export const schemaSql = `
create extension if not exists pgcrypto;

create table if not exists companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  website text,
  city text,
  county text,
  niche text,
  owner_or_manager text,
  email text,
  phone text,
  lead_leak_signal text,
  status text not null default 'Not contacted',
  next_step text,
  notes text,
  source text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists company_messages (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  role text not null check (role in ('me', 'them', 'ai')),
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists email_tasks (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  task_type text not null default 'first_follow_up',
  subject text not null,
  body text not null,
  status text not null default 'draft',
  recipient text,
  scheduled_for timestamptz,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists companies_name_phone_idx on companies(name, coalesce(phone, ''));
create index if not exists companies_status_idx on companies(status);
create index if not exists company_messages_company_idx on company_messages(company_id, created_at);
create index if not exists email_tasks_company_idx on email_tasks(company_id, created_at desc);
`;
