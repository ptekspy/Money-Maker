import { getSql } from "@/lib/database";
import { sendEmail } from "@/lib/email";

type DueReminder = {
  certificate_id: string;
  email: string;
  address: string;
  kind: string;
  expiry_date: string;
  days_left: number;
};

export async function GET(request: Request) {
  const authorization = request.headers.get("authorization");
  if (
    !process.env.CRON_SECRET ||
    authorization !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sql = getSql();
  const due = (await sql`
    select
      c.id as certificate_id,
      u.email,
      p.address,
      c.kind,
      c.expiry_date::text,
      (c.expiry_date - current_date)::int as days_left
    from certcue_certificates c
    join certcue_properties p on p.id = c.property_id
    join certcue_users u on u.id = p.user_id
    where u.subscription_status = 'active'
      and (c.expiry_date - current_date) in (90, 30, 14, 7, 0)
      and not exists (
        select 1 from certcue_reminder_sends r
        where r.certificate_id = c.id
          and r.reminder_days = (c.expiry_date - current_date)
          and r.reminder_date = current_date
      )
  `) as DueReminder[];

  let sent = 0;
  for (const reminder of due) {
    const timing =
      reminder.days_left === 0
        ? "expires today"
        : `expires in ${reminder.days_left} days`;
    await sendEmail({
      to: reminder.email,
      subject: `${reminder.kind} ${timing} — ${reminder.address}`,
      text: `${reminder.kind} for ${reminder.address} ${timing} (${reminder.expiry_date}).\n\nOpen LetDue to update the certificate after renewal.`,
    });
    await sql`
      insert into certcue_reminder_sends (certificate_id, reminder_days)
      values (${reminder.certificate_id}, ${reminder.days_left})
      on conflict do nothing
    `;
    sent += 1;
  }

  return Response.json({ due: due.length, sent });
}
