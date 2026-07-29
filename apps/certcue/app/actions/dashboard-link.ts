"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { getUserByEmail } from "@/lib/data";
import { sendEmail } from "@/lib/email";

const dashboardLinkSchema = z.object({
  email: z.email().trim().toLowerCase(),
  website: z.string().max(0).optional(),
});

export async function sendDashboardLink(formData: FormData) {
  const parsed = dashboardLinkSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success || parsed.data.website) {
    redirect("/welcome?dashboard=sent");
  }

  const user = await getUserByEmail(parsed.data.email);
  if (user) {
    const appUrl = process.env.NEXT_PUBLIC_CERTCUE_URL ?? "https://letdue.com";
    const dashboardUrl = `${appUrl}/dashboard/${user.accessToken}`;
    await sendEmail({
      to: user.email,
      subject: "Your LetDue dashboard link",
      text: `Open your private LetDue dashboard:
${dashboardUrl}

Keep this link private.

If you recently paid, your monitoring will show as active once Stripe has confirmed checkout.

LetDue organises documents, dates and reminders. It does not provide legal advice or guarantee compliance.`,
    });
  }

  redirect("/welcome?dashboard=sent");
}
