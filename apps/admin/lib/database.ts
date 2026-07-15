import { neon } from "@neondatabase/serverless";

export type Company = {
  id: string;
  name: string;
  website: string | null;
  city: string | null;
  county: string | null;
  niche: string | null;
  owner_or_manager: string | null;
  email: string | null;
  phone: string | null;
  lead_leak_signal: string | null;
  status: string;
  next_step: string | null;
  notes: string | null;
  source: string | null;
  created_at: string;
  updated_at: string;
};

export type CompanyMessage = {
  id: string;
  company_id: string;
  role: "me" | "them" | "ai";
  body: string;
  created_at: string;
};

export type EmailTask = {
  id: string;
  company_id: string;
  task_type: string;
  subject: string;
  body: string;
  status: "draft" | "scheduled" | "sent" | "failed";
  recipient: string | null;
  scheduled_for: string | null;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
};

export function getSql() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured.");
  }
  return neon(databaseUrl);
}

export async function listCompanies() {
  const sql = getSql();
  return (await sql`
    select *
    from companies
    order by
      case status
        when 'Interested' then 1
        when 'Replied' then 2
        when 'Contacted' then 3
        when 'Not contacted' then 4
        else 5
      end,
      updated_at desc
  `) as Company[];
}

export async function getCompany(id: string) {
  const sql = getSql();
  const rows = (await sql`
    select *
    from companies
    where id = ${id}
  `) as Company[];
  return rows[0] ?? null;
}

export async function listCompanyMessages(companyId: string) {
  const sql = getSql();
  return (await sql`
    select *
    from company_messages
    where company_id = ${companyId}
    order by created_at asc
  `) as CompanyMessage[];
}

export async function listEmailTasks(companyId: string) {
  const sql = getSql();
  return (await sql`
    select *
    from email_tasks
    where company_id = ${companyId}
    order by created_at desc
  `) as EmailTask[];
}
