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
  getUser,
  listPortfolio,
  setUserAdminSuspended,
  setUserPropertyLimit,
} from "@/lib/data";
import { sendEmail } from "@/lib/email";

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
    .max(100)
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
