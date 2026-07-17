"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { activatePilot } from "@/lib/data";
import { sendEmail } from "@/lib/email";

const pilotSchema = z.object({
  email: z.email(),
  address: z.string().trim().min(5).max(200),
  hasGas: z.enum(["true", "false"]),
  isHmo: z.enum(["true", "false"]),
  gasSafety: z.string().max(10),
  eicr: z.string().max(10),
  epc: z.string().max(10),
  insurance: z.string().max(10),
  propertyLicence: z.string().max(10),
  source: z
    .string()
    .regex(/^[a-z0-9-]{1,64}$/)
    .default("homepage"),
  companyWebsite: z.literal("").optional().default(""),
});

export async function startPilot(formData: FormData) {
  const parsed = pilotSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/?pilot=invalid#audit");

  const data = parsed.data;
  const activated = await activatePilot({
    email: data.email,
    address: data.address,
    hasGas: data.hasGas === "true",
    isHmo: data.isHmo === "true",
    source: data.source,
    dates: {
      "Gas safety": data.gasSafety,
      EICR: data.eicr,
      EPC: data.epc,
      "Landlord insurance": data.insurance,
      "Property licence": data.propertyLicence,
    },
  });
  if (!activated) redirect("/?pilot=existing#audit");

  const appUrl = process.env.NEXT_PUBLIC_CERTCUE_URL ?? "https://letdue.com";
  const dashboardUrl = `${appUrl}/dashboard/${activated.user.accessToken}`;
  try {
    await sendEmail({
      to: activated.user.email,
      subject: "Your free LetDue pilot is active",
      text: `Your 14-day LetDue pilot is active for ${data.address}.\n\nOpen your private dashboard: ${dashboardUrl}\n\nKeep this link private. For help or to stop reminders, contact hello@letdue.com.`,
    });
  } catch {
    // The dashboard remains available immediately while SES production access
    // is pending or if a confirmation email is temporarily undeliverable.
  }

  redirect(`/dashboard/${activated.user.accessToken}?pilot=started`);
}
