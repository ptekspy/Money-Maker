export const schemaSql = `
create extension if not exists pgcrypto;

create table if not exists certcue_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  access_token uuid not null default gen_random_uuid() unique,
  stripe_customer_id text unique,
  subscription_status text not null default 'inactive',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists certcue_properties (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references certcue_users(id) on delete cascade,
  stripe_session_id text unique,
  address text not null,
  has_gas boolean not null default true,
  is_hmo boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists certcue_certificates (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references certcue_properties(id) on delete cascade,
  kind text not null,
  expiry_date date,
  document_url text,
  created_at timestamptz not null default now(),
  unique(property_id, kind)
);

create table if not exists certcue_reminder_sends (
  id uuid primary key default gen_random_uuid(),
  certificate_id uuid not null references certcue_certificates(id) on delete cascade,
  reminder_days integer not null,
  reminder_date date not null default current_date,
  sent_at timestamptz not null default now(),
  unique(certificate_id, reminder_days, reminder_date)
);

create index if not exists certcue_properties_user_idx on certcue_properties(user_id);
create index if not exists certcue_certificates_expiry_idx on certcue_certificates(expiry_date);
`;
