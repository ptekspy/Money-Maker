import { getSql } from "@/lib/database";
import { sendViaGmail } from "@/lib/gmail";

export async function GET() {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    return Response.json({
      sent: 0,
      skipped: "Gmail credentials are not configured.",
    });
  }

  const sql = getSql();
  const due = (await sql`
    select id, recipient, subject, body
    from email_tasks
    where status = 'scheduled'
      and scheduled_for is not null
      and scheduled_for <= now()
      and recipient is not null
    order by scheduled_for asc
    limit 10
  `) as {
    id: string;
    recipient: string;
    subject: string;
    body: string;
  }[];

  let sent = 0;

  for (const task of due) {
    await sendViaGmail({
      to: task.recipient,
      subject: task.subject,
      body: task.body,
    });
    await sql`
      update email_tasks
      set status = 'sent', sent_at = now(), updated_at = now()
      where id = ${task.id}
    `;
    sent += 1;
  }

  return Response.json({ sent });
}
