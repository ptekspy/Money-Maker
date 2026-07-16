"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCompany, getSql, listCompanyMessages } from "@/lib/database";
import { sendViaGmail } from "@/lib/gmail";
import { generateEmailDraft } from "@/lib/ollama";
import { schemaSql } from "@/lib/schema";

const csvRows = [
  [
    "HD Roofing Services Ltd",
    "https://www.hdroofingservicesltd.co.uk",
    "Bradford",
    "West Yorkshire",
    "Roofing",
    "Unknown",
    "",
    "01274 051575",
    "Open 24 hours; likely handles urgent repair enquiries; strong fit for missed enquiry recovery",
    "Not contacted",
    "Website form or public email",
    "Pitch missed-enquiry and quote follow-up recovery",
    "Yell",
  ],
  [
    "B Parkin And Son Roofing",
    "",
    "Bradford",
    "West Yorkshire",
    "Roofing",
    "Unknown",
    "",
    "01274 621930",
    "High review count; established local roofer; likely steady enquiry volume",
    "Not contacted",
    "Directory enquiry button if available",
    "Ask if old quotes are followed up systematically",
    "Yell",
  ],
  [
    "Cousin's Roofing (Bradford) Ltd",
    "https://www.facebook.com",
    "Bradford",
    "West Yorkshire",
    "Roofing",
    "Unknown",
    "",
    "07763 883558",
    "Local Bradford business; Facebook presence suggests enquiries may be spread across channels",
    "Not contacted",
    "Facebook message",
    "Lead angle: recover Facebook and phone enquiries that went cold",
    "Yell",
  ],
  [
    "Alvadac Rubber Flat Roofing Installers & Suppliers",
    "https://www.flatroofexperts.co.uk",
    "Bradford",
    "West Yorkshire",
    "Flat roofing",
    "Unknown",
    "",
    "01274 737828",
    "Flat roof specialist; paid directory presence; mentions Checkatrade rating",
    "Not contacted",
    "Website form or public email",
    "Lead angle: old flat roof quotes and repair enquiries",
    "Yell",
  ],
  [
    "Roofline Maintenance Services Ltd",
    "https://www.theroofline.co.uk",
    "Bradford",
    "West Yorkshire",
    "Roofing",
    "Unknown",
    "",
    "07466 791641",
    "Open 24 hours and high review count; urgent repair/recovery fit",
    "Not contacted",
    "Website form or public email",
    "Lead angle: missed emergency roofline/gutter enquiries",
    "Yell",
  ],
  [
    "Frank Ryan & Sons Ltd",
    "https://www.fryanroofing.co.uk",
    "Bradford",
    "West Yorkshire",
    "Roofing",
    "Unknown",
    "",
    "01274 350993",
    "Established over 40 years; free quotations; likely has quote follow-up gaps",
    "Not contacted",
    "Website form or public email",
    "Lead angle: recover unclosed free quotations",
    "Yell",
  ],
  [
    "Chippendale Roofing Ltd",
    "https://www.chippendaleroofingltd.com",
    "Bradford",
    "West Yorkshire",
    "Roofing",
    "Unknown",
    "",
    "01274 601529",
    "Family-run; roof repairs and gutter services; local quotation workflow fit",
    "Not contacted",
    "Website form or public email",
    "Lead angle: follow-up for repair quotes after bad weather",
    "Yell",
  ],
  [
    "P & L Industrial Roofing Ltd",
    "https://www.pandlindustrialroofingcontractorsltd.co.uk",
    "Bradford",
    "West Yorkshire",
    "Industrial roofing",
    "Unknown",
    "",
    "01274 214362",
    "Open 24 hours; commercial/industrial jobs have high value",
    "Not contacted",
    "Website form or public email",
    "Lead angle: revive commercial maintenance and repair enquiries",
    "Yell",
  ],
  [
    "HomeServices - The LOCAL Gutterman",
    "https://homeservicesdirect.uk",
    "Bradford",
    "West Yorkshire",
    "Gutter repairs",
    "Unknown",
    "",
    "0800 118 2063",
    "Gutter repair focus; no call-out charge; likely high volume smaller jobs",
    "Not contacted",
    "Website form or public email",
    "Lead angle: recover missed gutter repair enquiries",
    "Yell",
  ],
  [
    "Roof Finish Solutions LTD",
    "https://www.rooffinishsolutions.com",
    "Bradford",
    "West Yorkshire",
    "Roofing",
    "Unknown",
    "",
    "0113 734 0067",
    "Sponsored listing; pays for lead generation; serves Bradford",
    "Not contacted",
    "Website form or public email",
    "Lead angle: get more return from paid lead spend",
    "Yell",
  ],
  [
    "Green's Roofing Co Ltd",
    "https://www.greensroofingltd.co.uk",
    "Bradford",
    "West Yorkshire",
    "Roofing",
    "Unknown",
    "",
    "01535 280619",
    "Sponsored/listed; emergency roofing repairs; strong review rating",
    "Not contacted",
    "Website form or public email",
    "Lead angle: missed emergency repair enquiries",
    "Yell",
  ],
  [
    "Robinsons Roofing",
    "https://robinsonsroofing.uk",
    "Bradford",
    "West Yorkshire",
    "Roofing",
    "Unknown",
    "",
    "0113 5325154",
    "Sponsored/listed; free quotes and estimates; serves Bradford",
    "Not contacted",
    "Website form or public email",
    "Lead angle: recover old free quotes and estimates",
    "Yell",
  ],
  [
    "Randles Roofing And Building Services",
    "https://randlesroofingservices.co.uk",
    "Bradford",
    "West Yorkshire",
    "Roofing",
    "Unknown",
    "",
    "01706 541959",
    "Family-run; guarantees and free quotes; paid listing suggests lead spend",
    "Not contacted",
    "Website form or public email",
    "Lead angle: recover quote pipeline from last 90 days",
    "Yell",
  ],
  [
    "JMC Roofing Ltd",
    "https://jmcroofingleeds.co.uk",
    "Bradford",
    "West Yorkshire",
    "Roofing",
    "Unknown",
    "",
    "0113 3228276",
    "Re-roofing specialist; higher ticket projects; serves Bradford",
    "Not contacted",
    "Website form or public email",
    "Lead angle: re-roof quote follow-up",
    "Yell",
  ],
  [
    "Grimston Asbestos Removal",
    "https://www.grimstongaragesltd.co.uk",
    "Bradford",
    "West Yorkshire",
    "Garage roofing/asbestos",
    "Unknown",
    "",
    "01274 660060",
    "Garage roof replacement niche; open late; local high-intent repairs",
    "Not contacted",
    "Website form or public email",
    "Lead angle: missed asbestos/garage roof enquiries",
    "Yell",
  ],
  [
    "I C Roofing And Cladding (NW) Limited",
    "https://www.icroofingandcladdingnw.co.uk",
    "Bradford",
    "West Yorkshire",
    "Commercial roofing",
    "Unknown",
    "",
    "01744 802763",
    "Commercial roofing and cladding; nationwide coverage; higher-value leads",
    "Not contacted",
    "Website form or public email",
    "Lead angle: recover old commercial roof enquiries",
    "Yell",
  ],
  [
    "Rafferty Roof Trusses Ltd",
    "https://www.raffertyrooftrusses.co.uk",
    "Bradford",
    "West Yorkshire",
    "Roof trusses",
    "Unknown",
    "",
    "01422 411025",
    "Specialist trusses; B2B/B2C enquiries may need structured follow-up",
    "Not contacted",
    "Website form or public email",
    "Lead angle: unclosed quotation follow-up",
    "Yell",
  ],
  [
    "R & N Building Services Ltd",
    "",
    "Bradford",
    "West Yorkshire",
    "Roofing/building",
    "Unknown",
    "",
    "07702 757718",
    "Open 24 hours; broad service business; likely urgent-enquiry led",
    "Not contacted",
    "Directory enquiry button if available",
    "Lead angle: missed enquiries and stale repair quotes",
    "Yell",
  ],
  [
    "SW Roofing and Building Ltd",
    "",
    "Bradford",
    "West Yorkshire",
    "Roofing/building",
    "Unknown",
    "",
    "07377 725236",
    "Open 24 hours; small number of reviews; may need better lead handling",
    "Not contacted",
    "Directory enquiry button if available",
    "Lead angle: simple recovery scan for missed enquiries",
    "Yell",
  ],
  [
    "High Design Roofing",
    "https://www.highdesignroofing.com",
    "Bradford",
    "West Yorkshire",
    "Roofing",
    "Unknown",
    "",
    "07379 479448",
    "No ratings on listing; website present; may be growth-focused",
    "Not contacted",
    "Website form or public email",
    "Lead angle: turn current enquiries into booked jobs",
    "Yell",
  ],
];

function value(formData: FormData, key: string) {
  const text = String(formData.get(key) ?? "").trim();
  return text || null;
}

export async function initializeDatabase() {
  const sql = getSql();
  await sql.query(schemaSql);

  for (const row of csvRows) {
    await sql`
      insert into companies (
        name, website, city, county, niche, owner_or_manager, email, phone,
        lead_leak_signal, status, next_step, notes, source
      )
      values (
        ${row[0]}, ${row[1] || null}, ${row[2]}, ${row[3]}, ${row[4]},
        ${row[5]}, ${row[6] || null}, ${row[7]}, ${row[8]}, ${row[9]},
        ${row[10]}, ${row[11]}, ${row[12]}
      )
      on conflict do nothing
    `;
  }

  revalidatePath("/");
}

export async function addCompany(formData: FormData) {
  const sql = getSql();
  await sql`
    insert into companies (
      name, website, city, county, niche, owner_or_manager, email, phone,
      lead_leak_signal, status, next_step, notes, source
    )
    values (
      ${value(formData, "name")}, ${value(formData, "website")},
      ${value(formData, "city")}, ${value(formData, "county")},
      ${value(formData, "niche")}, ${value(formData, "owner_or_manager")},
      ${value(formData, "email")}, ${value(formData, "phone")},
      ${value(formData, "lead_leak_signal")}, 'Not contacted',
      ${value(formData, "next_step")}, ${value(formData, "notes")},
      ${value(formData, "source") ?? "Manual"}
    )
  `;
  revalidatePath("/");
}

export async function updateCompanyStatus(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "Not contacted");
  const sql = getSql();
  await sql`
    update companies
    set status = ${status}, updated_at = now()
    where id = ${id}
  `;
  revalidatePath("/");
  revalidatePath(`/companies/${id}`);
}

export async function addCompanyMessage(formData: FormData) {
  const companyId = String(formData.get("company_id") ?? "");
  const role = String(formData.get("role") ?? "me");
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return;

  const sql = getSql();
  await sql`
    insert into company_messages (company_id, role, body)
    values (${companyId}, ${role}, ${body})
  `;
  revalidatePath(`/companies/${companyId}`);
}

export async function generateDraft(formData: FormData) {
  const companyId = String(formData.get("company_id") ?? "");
  const taskType = String(formData.get("task_type") ?? "first_follow_up");
  const company = await getCompany(companyId);
  if (!company) return;

  const messages = await listCompanyMessages(companyId);
  const draft = await generateEmailDraft(company, messages, taskType);
  const sql = getSql();

  await sql`
    insert into email_tasks (company_id, task_type, subject, body, recipient)
    values (${companyId}, ${taskType}, ${draft.subject}, ${draft.body}, ${company.email})
  `;
  revalidatePath(`/companies/${companyId}`);
}

export async function updateDraft(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const companyId = String(formData.get("company_id") ?? "");
  const sql = getSql();

  await sql`
    update email_tasks
    set
      subject = ${String(formData.get("subject") ?? "")},
      body = ${String(formData.get("body") ?? "")},
      recipient = ${value(formData, "recipient")},
      updated_at = now()
    where id = ${id}
  `;
  revalidatePath(`/companies/${companyId}`);
}

export async function sendDraft(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const companyId = String(formData.get("company_id") ?? "");
  const sql = getSql();
  const rows = (await sql`
    select recipient, subject, body
    from email_tasks
    where id = ${id}
  `) as {
    recipient: string | null;
    subject: string;
    body: string;
  }[];
  const draft = rows[0];
  if (!draft?.recipient) return;

  await sendViaGmail({
    to: draft.recipient,
    subject: draft.subject,
    body: draft.body,
  });

  await sql`
    update email_tasks
    set status = 'sent', sent_at = now(), updated_at = now()
    where id = ${id}
  `;
  revalidatePath(`/companies/${companyId}`);
}

export async function scheduleDraft(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const companyId = String(formData.get("company_id") ?? "");
  const scheduledFor = value(formData, "scheduled_for");
  const sql = getSql();

  await sql`
    update email_tasks
    set status = 'scheduled', scheduled_for = ${scheduledFor}, updated_at = now()
    where id = ${id}
  `;
  revalidatePath(`/companies/${companyId}`);
}

export async function goToCompany(formData: FormData) {
  redirect(`/companies/${String(formData.get("company_id") ?? "")}`);
}
