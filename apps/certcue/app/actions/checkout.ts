"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { getStripe } from "@/lib/stripe";

const checkoutSchema = z.object({
  email: z.email(),
  address: z.string().trim().min(5).max(200),
  hasGas: z.enum(["true", "false"]),
  isHmo: z.enum(["true", "false"]),
  gasSafety: z.string().max(10),
  eicr: z.string().max(10),
  epc: z.string().max(10),
  insurance: z.string().max(10),
  propertyLicence: z.string().max(10),
});

export async function startCheckout(formData: FormData) {
  const parsed = checkoutSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/?checkout=invalid#audit");

  const priceId = process.env.STRIPE_CERTCUE_ANNUAL_PRICE_ID;
  const appUrl = process.env.NEXT_PUBLIC_CERTCUE_URL;
  if (!priceId || !appUrl || !process.env.STRIPE_SECRET_KEY) {
    redirect("/setup-required");
  }

  const data = parsed.data;
  const onboarding = JSON.stringify({
    address: data.address,
    hasGas: data.hasGas === "true",
    isHmo: data.isHmo === "true",
    dates: {
      "Gas safety": data.gasSafety,
      EICR: data.eicr,
      EPC: data.epc,
      "Landlord insurance": data.insurance,
      "Property licence": data.propertyLicence,
    },
  });

  const session = await getStripe().checkout.sessions.create({
    mode: "subscription",
    customer_email: data.email,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/welcome?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/?checkout=cancelled#audit`,
    allow_promotion_codes: true,
    metadata: { onboarding },
    subscription_data: { metadata: { product: "certcue" } },
  });

  if (!session.url) throw new Error("Stripe did not return a checkout URL.");
  redirect(session.url);
}
