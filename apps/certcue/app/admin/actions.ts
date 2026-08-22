"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import {
  adminEmail,
  clearAdminSession,
  hashAdminToken,
  newAdminToken,
  requireAdmin,
} from "@/lib/admin-auth";
import {
  createAdminLoginToken,
  createOffer,
  getUser,
  getUserByEmail,
  listPortfolio,
  setUserAdminSuspended,
  setUserPropertyLimit,
} from "@/lib/data";
import { sendEmail } from "@/lib/email";
import { hashUserToken, newUserToken } from "@/lib/user-auth";

const packageSchema = z.object({
  email: z.email().trim().toLowerCase(),
  propertyLimit: z.coerce.number().int().min(1).max(10_000),
  price: z
    .string()
    .trim()
    .regex(/^\d{1,5}(?:\.\d{1,2})?$/),
});

export async function sendCustomerPackage(formData: FormData) {
  await requireAdmin();
  const parsed = packageSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/admin/offers?error=invalid");

  const pricePence = Math.round(Number(parsed.data.price) * 100);
  if (pricePence < 100 || pricePence > 1_000_000)
    redirect("/admin/offers?error=invalid");

  const existing = await getUserByEmail(parsed.data.email);
  if (existing?.plan === "paid" && existing.subscriptionStatus === "active") {
    redirect("/admin/offers?error=active");
  }

  const token = newUserToken();
  const offer = {
    id: crypto.randomUUID(),
    email: parsed.data.email,
    propertyLimit: parsed.data.propertyLimit,
    pricePence,
    status: "sent" as const,
    createdAt: new Date().toISOString(),
    expiresAtEpoch: Math.floor(Date.now() / 1000) + 7 * 86_400,
  };
  await createOffer(offer, hashUserToken(token));

  const appUrl = process.env.NEXT_PUBLIC_CERTCUE_URL ?? "https://letdue.com";
  const price = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(pricePence / 100);
  await sendEmail({
    to: offer.email,
    replyTo: adminEmail(),
    subject: `Your LetDue package for up to ${offer.propertyLimit} properties`,
    text: [
      "Hello,",
      "",
      "Here is the LetDue package prepared for you:",
      `• Up to ${offer.propertyLimit} properties`,
      `• ${price} per year`,
      "• Certificate storage and deadline reminders",
      "",
      "Create your password and continue to secure Stripe Checkout:",
      `${appUrl}/offer/${token}`,
      "",
      "This private link expires in 7 days. It is intended only for this email address.",
      "If you have a question before paying, reply to this email.",
      "",
      "LetDue organises records and reminders. It does not provide legal advice or guarantee compliance.",
    ].join("\n"),
  });

  redirect("/admin/offers?sent=1");
}

export async function requestAdminLink(formData: FormData) {
  const email = z.email().trim().toLowerCase().safeParse(formData.get("email"));
  if (!email.success || email.data !== adminEmail()) {
    redirect("/admin/login?sent=1");
  }

  const token = newAdminToken();
  const created = await createAdminLoginToken({
    email: email.data,
    tokenHash: hashAdminToken(token),
    expiresAtEpoch: Math.floor(Date.now() / 1000) + 15 * 60,
  });

  if (created) {
    const appUrl = process.env.NEXT_PUBLIC_CERTCUE_URL ?? "https://letdue.com";
    await sendEmail({
      to: email.data,
      subject: "Your LetDue admin sign-in link",
      text: [
        "Use this private link to sign in to LetDue admin:",
        "",
        `${appUrl}/admin/verify?token=${token}`,
        "",
        "The link expires in 15 minutes and can only be used once.",
        "If you did not request it, you can ignore this email.",
      ].join("\n"),
    });
  }

  redirect("/admin/login?sent=1");
}

export async function logoutAdmin() {
  await requireAdmin();
  await clearAdminSession();
  redirect("/admin/login");
}

export async function updatePropertyLimit(formData: FormData) {
  await requireAdmin();
  const userId = z.uuid().safeParse(formData.get("userId"));
  const limit = z.coerce
    .number()
    .int()
    .min(1)
    .max(10_000)
    .safeParse(formData.get("propertyLimit"));
  if (!userId.success || !limit.success || !(await getUser(userId.data)))
    return;
  const properties = await listPortfolio(userId.data);
  if (limit.data < properties.length) return;
  await setUserPropertyLimit(userId.data, limit.data);
  redirect(`/admin/customers/${userId.data}?saved=limit`);
}

export async function updateSuspension(formData: FormData) {
  await requireAdmin();
  const userId = z.uuid().safeParse(formData.get("userId"));
  const suspended = z
    .enum(["true", "false"])
    .safeParse(formData.get("suspended"));
  if (!userId.success || !suspended.success || !(await getUser(userId.data)))
    return;
  await setUserAdminSuspended(userId.data, suspended.data === "true");
  redirect(`/admin/customers/${userId.data}?saved=status`);
}

export async function resendDashboardLink(formData: FormData) {
  await requireAdmin();
  const userId = z.uuid().safeParse(formData.get("userId"));
  if (!userId.success) return;
  const user = await getUser(userId.data);
  if (!user) return;
  const appUrl = process.env.NEXT_PUBLIC_CERTCUE_URL ?? "https://letdue.com";
  await sendEmail({
    to: user.email,
    subject: "Your LetDue dashboard link",
    text: [
      "Here is the private LetDue dashboard link you requested:",
      "",
      `${appUrl}/dashboard/${user.accessToken}`,
      "",
      "Keep this link private. If you did not request it, reply to this email.",
    ].join("\n"),
  });
  redirect(`/admin/customers/${userId.data}?saved=link`);
}
