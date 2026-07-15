import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!transporter) {
    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASSWORD;
    if (!host || !user || !pass) throw new Error("SMTP is not configured.");
    transporter = nodemailer.createTransport({
      host,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: { user, pass },
    });
  }
  return transporter;
}

export async function sendEmail(options: {
  to: string;
  subject: string;
  text: string;
}) {
  await getTransporter().sendMail({
    from: process.env.EMAIL_FROM ?? "LetDue <reminders@letdue.com>",
    ...options,
  });
}
