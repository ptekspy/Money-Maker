"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { getUserByToken, listPortfolio } from "@/lib/data";
import { sendEmail } from "@/lib/email";

const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.email().trim().toLowerCase(),
  role: z.string().trim().max(80).optional(),
  intent: z.string().trim().max(120).optional(),
  message: z.string().trim().min(10).max(4000),
  website: z.string().max(0).optional(),
});

const supportSchema = z.object({
  token: z.uuid(),
  subject: z.string().trim().min(3).max(160),
  message: z.string().trim().min(10).max(4000),
  pageUrl: z.string().trim().max(500).optional(),
  userAgent: z.string().trim().max(500).optional(),
  timezone: z.string().trim().max(120).optional(),
  language: z.string().trim().max(80).optional(),
  screen: z.string().trim().max(80).optional(),
  website: z.string().max(0).optional(),
});

function supportInbox() {
  return process.env.SUPPORT_EMAIL ?? "hello@letdue.com";
}

export async function sendPublicContact(formData: FormData) {
  const parsed = contactSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success || parsed.data.website) {
    redirect("/?contact=error#contact");
  }

  const { name, email, role, intent, message } = parsed.data;
  const intentLabel = intent || "Not supplied";
  await sendEmail({
    to: supportInbox(),
    replyTo: email,
    subject: `LetDue public contact: ${intentLabel} — ${name}`,
    text: [
      "New public LetDue contact form submission.",
      "",
      `Name: ${name}`,
      `Email: ${email}`,
      `Role: ${role || "Not supplied"}`,
      `Intent: ${intentLabel}`,
      "",
      "Message:",
      message,
    ].join("\n"),
  });

  redirect("/?contact=sent#contact");
}

export async function sendInAppSupport(formData: FormData) {
  const parsed = supportSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success || parsed.data.website) return;

  const user = await getUserByToken(parsed.data.token);
  if (!user) return;

  const portfolio = await listPortfolio(user.id);
  const certificateCount = portfolio.reduce(
    (count, property) => count + property.certificates.length,
    0,
  );
  const propertySummary =
    portfolio.length > 0
      ? portfolio
          .map(
            (property) =>
              `- ${property.address} (${property.certificates.length} certificates)`,
          )
          .join("\n")
      : "- No properties yet";

  await sendEmail({
    to: supportInbox(),
    replyTo: user.email,
    subject: `LetDue support: ${parsed.data.subject}`,
    text: [
      "New in-app LetDue support request.",
      "",
      "Account context:",
      `User ID: ${user.id}`,
      `Email: ${user.email}`,
      `Plan: ${user.plan ?? "unknown"}`,
      `Subscription status: ${user.subscriptionStatus}`,
      `Pilot ends: ${user.pilotEndsAt ?? "n/a"}`,
      `Stripe customer: ${user.stripeCustomerId ?? "n/a"}`,
      `Acquisition source: ${user.acquisitionSource ?? "n/a"}`,
      `Properties: ${portfolio.length}`,
      `Certificates: ${certificateCount}`,
      "",
      "Portfolio:",
      propertySummary,
      "",
      "Install/browser context:",
      `Page URL: ${parsed.data.pageUrl || "Not supplied"}`,
      `Timezone: ${parsed.data.timezone || "Not supplied"}`,
      `Language: ${parsed.data.language || "Not supplied"}`,
      `Screen: ${parsed.data.screen || "Not supplied"}`,
      `User agent: ${parsed.data.userAgent || "Not supplied"}`,
      "",
      "Customer message:",
      parsed.data.message,
    ].join("\n"),
  });

  redirect(`/dashboard/${parsed.data.token}?support=sent#support`);
}
