"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import {
  acceptOfferAndCreateCredentials,
  createOffer,
  getUserByEmail,
  type LetDueOffer,
} from "@/lib/data";
import { annualPricePenceForLimit, isPublicPropertyLimit } from "@/lib/pricing";
import { getStripe } from "@/lib/stripe";
import {
  establishUserSession,
  hashPassword,
  hashUserToken,
  newUserToken,
} from "@/lib/user-auth";

const signupSchema = z
  .object({
    email: z.email().trim().toLowerCase(),
    password: z.string().min(10).max(128),
    confirmPassword: z.string().min(10).max(128),
    propertyLimit: z.coerce.number().int(),
    source: z
      .string()
      .trim()
      .regex(/^[a-z0-9-]{1,64}$/)
      .optional(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
  });

export async function startPublicSignup(formData: FormData) {
  const parsed = signupSchema.safeParse(Object.fromEntries(formData));
  const safeLimit = z.coerce
    .number()
    .int()
    .safeParse(formData.get("propertyLimit"));
  const fallbackLimit =
    safeLimit.success && isPublicPropertyLimit(safeLimit.data)
      ? safeLimit.data
      : 3;
  if (!parsed.success || !isPublicPropertyLimit(parsed.data.propertyLimit)) {
    redirect(`/signup?pack=${fallbackLimit}&error=details`);
  }

  const appUrl = process.env.NEXT_PUBLIC_CERTCUE_URL;
  const basePriceId = process.env.STRIPE_CERTCUE_ANNUAL_PRICE_ID;
  if (!appUrl || !basePriceId || !process.env.STRIPE_SECRET_KEY) {
    redirect("/setup-required");
  }

  const { email, password, propertyLimit } = parsed.data;
  const existingUser = await getUserByEmail(email);
  if (
    existingUser?.plan === "paid" &&
    existingUser.subscriptionStatus === "active"
  ) {
    redirect("/login");
  }

  const source = parsed.data.source ?? `pricing-${propertyLimit}`;
  const offerToken = newUserToken();
  const offer: LetDueOffer = {
    id: crypto.randomUUID(),
    email,
    propertyLimit,
    pricePence: annualPricePenceForLimit(propertyLimit),
    status: "sent",
    createdAt: new Date().toISOString(),
    expiresAtEpoch: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
  };
  await createOffer(offer, hashUserToken(offerToken));

  const userId = existingUser?.id ?? crypto.randomUUID();
  const accessToken = existingUser?.accessToken ?? crypto.randomUUID();
  const stripe = getStripe();
  const basePrice = await stripe.prices.retrieve(basePriceId);
  const product =
    typeof basePrice.product === "string"
      ? basePrice.product
      : basePrice.product.id;
  const session = await stripe.checkout.sessions.create(
    {
      mode: "subscription",
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "gbp",
            unit_amount: offer.pricePence,
            recurring: { interval: "year" },
            product,
          },
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/account?billing=processing`,
      cancel_url: `${appUrl}/offer/${offerToken}?checkout=cancelled`,
      metadata: {
        offerId: offer.id,
        userId,
        propertyLimit: String(propertyLimit),
        acquisitionSource: source,
      },
      subscription_data: {
        metadata: {
          product: "letdue",
          offerId: offer.id,
          userId,
          propertyLimit: String(propertyLimit),
          acquisitionSource: source,
        },
      },
    },
    { idempotencyKey: `letdue-public-signup-${offer.id}` },
  );
  if (!session.url) throw new Error("Stripe did not return a checkout URL.");

  const credentials = await hashPassword(password);
  try {
    await acceptOfferAndCreateCredentials({
      offer,
      userId,
      accessToken,
      ...credentials,
      checkoutSessionId: session.id,
      existingUser: Boolean(existingUser),
      acquisitionSource: source,
    });
  } catch (error) {
    try {
      await stripe.checkout.sessions.expire(session.id);
    } catch {
      // The session may already have been expired by a competing request.
    }
    if ((error as { name?: string }).name === "TransactionCanceledException") {
      redirect(`/signup?pack=${propertyLimit}&error=account`);
    }
    throw error;
  }

  await establishUserSession(userId);
  redirect(session.url);
}
