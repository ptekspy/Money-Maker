import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";

let client: SESv2Client | null = null;

function getSesClient() {
  client ??= new SESv2Client({});
  return client;
}

export async function sendEmail(options: {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
}) {
  if (process.env.LETDUE_LOCAL_SANDBOX === "1") {
    console.info(`[LetDue sandbox email] ${options.subject} -> ${options.to}`);
    return;
  }
  const from = process.env.EMAIL_FROM ?? "LetDue <reminders@letdue.com>";
  await getSesClient().send(
    new SendEmailCommand({
      FromEmailAddress: from,
      Destination: { ToAddresses: [options.to] },
      ReplyToAddresses: options.replyTo ? [options.replyTo] : undefined,
      Content: {
        Simple: {
          Subject: { Data: options.subject, Charset: "UTF-8" },
          Body: { Text: { Data: options.text, Charset: "UTF-8" } },
        },
      },
    }),
  );
}
