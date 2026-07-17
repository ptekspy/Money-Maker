import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";
import { emailWasSent, markEmailSent } from "@/lib/data";

let client: SESv2Client | null = null;

function ses() {
  if (!client) client = new SESv2Client({});
  return client;
}

export async function sendEmail(options: {
  to: string;
  subject: string;
  text: string;
}) {
  const from =
    process.env.CONTRACTGUARD_EMAIL_FROM ??
    "API Contract Guard <admin@apicontractguard.com>";
  await ses().send(
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

export async function sendEmailOnce(options: {
  ownerKey: string;
  kind: string;
  to: string;
  subject: string;
  text: string;
}) {
  if (!options.to || (await emailWasSent(options.ownerKey, options.kind)))
    return false;
  await sendEmail(options);
  await markEmailSent(options.ownerKey, options.kind);
  return true;
}
