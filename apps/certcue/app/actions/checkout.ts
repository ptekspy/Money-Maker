"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { getUserByToken } from "@/lib/data";
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
  source: z.string().trim().max(64).optional(),
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
    metadata: {
      onboarding,
      acquisitionSource: data.source ?? "homepage",
    },
    subscription_data: {
      metadata: {
        product: "letdue",
        acquisitionSource: data.source ?? "homepage",
      },
    },
  });

  if (!session.url) throw new Error("Stripe did not return a checkout URL.");
  redirect(session.url);
}

export async function startPilotCheckout(formData: FormData) {
  const token = z.uuid().safeParse(formData.get("token"));
  if (!token.success) redirect("/");

  const user = await getUserByToken(token.data);
  if (user?.plan !== "pilot") redirect("/");

  const priceId = process.env.STRIPE_CERTCUE_ANNUAL_PRICE_ID;
  const appUrl = process.env.NEXT_PUBLIC_CERTCUE_URL;
  if (!priceId || !appUrl || !process.env.STRIPE_SECRET_KEY) {
    redirect("/setup-required");
  }

  const session = await getStripe().checkout.sessions.create({
    mode: "subscription",
    customer_email: user.email,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/dashboard/${token.data}?billing=processing`,
    cancel_url: `${appUrl}/dashboard/${token.data}?billing=cancelled`,
    allow_promotion_codes: true,
    metadata: {
      upgradeToken: token.data,
      acquisitionSource: user.acquisitionSource ?? "unknown",
    },
    subscription_data: {
      metadata: {
        product: "letdue",
        acquisitionSource: user.acquisitionSource ?? "unknown",
      },
    },
  });

  if (!session.url) throw new Error("Stripe did not return a checkout URL.");
  redirect(session.url);
}
