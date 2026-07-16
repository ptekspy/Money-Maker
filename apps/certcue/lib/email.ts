import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";

const client = new SESv2Client({});

export async function sendEmail(options: {
  to: string;
  subject: string;
  text: string;
}) {
  const from = process.env.EMAIL_FROM ?? "LetDue <reminders@letdue.com>";
  await client.send(
    new SendEmailCommand({
      FromEmailAddress: from,
      Destination: { ToAddresses: [options.to] },
      Content: {
        Simple: {
          Subject: { Data: options.subject, Charset: "UTF-8" },
          Body: { Text: { Data: options.text, Charset: "UTF-8" } },
        },
      },
    }),
  );
}
