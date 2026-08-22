"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import {
  acceptOfferAndCreateCredentials,
  getOfferByTokenHash,
  getUserByEmail,
} from "@/lib/data";
import { getStripe } from "@/lib/stripe";
import {
  establishUserSession,
  hashPassword,
  hashUserToken,
} from "@/lib/user-auth";

const acceptanceSchema = z
  .object({
    token: z.string().regex(/^[A-Za-z0-9_-]{43}$/),
    password: z.string().min(10).max(128),
    confirmPassword: z.string().min(10).max(128),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
  });

export async function acceptCustomerPackage(formData: FormData) {
  const parsed = acceptanceSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const safeToken = z
      .string()
      .regex(/^[A-Za-z0-9_-]{43}$/)
      .safeParse(formData.get("token"));
    redirect(
      safeToken.success ? `/offer/${safeToken.data}?error=password` : "/",
    );
  }

  const offer = await getOfferByTokenHash(hashUserToken(parsed.data.token));
  if (!offer) redirect(`/offer/${parsed.data.token}?error=expired`);

  if (offer.status !== "sent") {
    if (offer.status === "accepted" && offer.checkoutSessionId) {
      const existingSession = await getStripe().checkout.sessions.retrieve(
        offer.checkoutSessionId,
      );
      if (existingSession.status === "open" && existingSession.url)
        redirect(existingSession.url);
    }
    redirect("/login");
  }

  const existingUser = await getUserByEmail(offer.email);
  if (
    existingUser?.plan === "paid" &&
    existingUser.subscriptionStatus === "active"
  ) {
    redirect("/login");
  }

  const userId = existingUser?.id ?? crypto.randomUUID();
  const accessToken = existingUser?.accessToken ?? crypto.randomUUID();
  const appUrl = process.env.NEXT_PUBLIC_CERTCUE_URL;
  if (!appUrl || !process.env.STRIPE_SECRET_KEY) redirect("/setup-required");

  const session = await getStripe().checkout.sessions.create(
    {
      mode: "subscription",
      customer_email: offer.email,
      line_items: [
        {
          price_data: {
            currency: "gbp",
            unit_amount: offer.pricePence,
            recurring: { interval: "year" },
            product_data: {
              name: `LetDue · up to ${offer.propertyLimit} properties`,
              description:
                "Certificate storage, deadline tracking and email reminders.",
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/account?billing=processing`,
      cancel_url: `${appUrl}/offer/${parsed.data.token}?checkout=cancelled`,
      metadata: {
        offerId: offer.id,
        userId,
        propertyLimit: String(offer.propertyLimit),
        acquisitionSource: "admin_offer",
      },
      subscription_data: {
        metadata: {
          product: "letdue",
          offerId: offer.id,
          userId,
          propertyLimit: String(offer.propertyLimit),
          acquisitionSource: "admin_offer",
        },
      },
    },
    { idempotencyKey: `letdue-offer-${offer.id}` },
  );
  if (!session.url) throw new Error("Stripe did not return a checkout URL.");

  const credentials = await hashPassword(parsed.data.password);
  try {
    await acceptOfferAndCreateCredentials({
      offer,
      userId,
      accessToken,
      ...credentials,
      checkoutSessionId: session.id,
      existingUser: Boolean(existingUser),
    });
  } catch (error) {
    if ((error as { name?: string }).name !== "TransactionCanceledException")
      throw error;
    try {
      await getStripe().checkout.sessions.expire(session.id);
    } catch {
      // A competing request may already be using or have completed the session.
    }
    redirect("/login");
  }

  await establishUserSession(userId);
  redirect(session.url);
}
