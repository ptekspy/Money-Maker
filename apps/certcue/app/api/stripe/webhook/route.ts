import type Stripe from "stripe";
import {
  activateCustomer,
  activateOfferSubscription,
  activatePilotSubscription,
  getOffer,
  getUserByToken,
  setSubscriptionStatus,
} from "@/lib/data";
import { sendEmail } from "@/lib/email";
import { getStripe } from "@/lib/stripe";

type Onboarding = {
  address: string;
  hasGas: boolean;
  isHmo: boolean;
  dates: Record<string, string>;
};

async function activateCheckout(session: Stripe.Checkout.Session) {
  const email = session.customer_details?.email ?? session.customer_email;
  const customerId =
    typeof session.customer === "string"
      ? session.customer
      : session.customer?.id;
  if (!customerId) return;

  const offerId = session.metadata?.offerId;
  const offerUserId = session.metadata?.userId;
  const offerPropertyLimit = Number(session.metadata?.propertyLimit);
  if (
    offerId &&
    offerUserId &&
    Number.isInteger(offerPropertyLimit) &&
    offerPropertyLimit >= 1 &&
    offerPropertyLimit <= 100
  ) {
    const offer = await getOffer(offerId);
    if (
      !offer ||
      offer.userId !== offerUserId ||
      offer.propertyLimit !== offerPropertyLimit ||
      session.currency !== "gbp" ||
      session.amount_total !== offer.pricePence ||
      offer.status === "paid"
    )
      return;
    const user = await activateOfferSubscription({
      offerId,
      userId: offerUserId,
      stripeCustomerId: customerId,
      propertyLimit: offerPropertyLimit,
    });
    if (!user) return;
    await sendEmail({
      to: user.email,
      subject: "Your LetDue package is active",
      text: [
        `Thank you. Your LetDue package for up to ${offerPropertyLimit} properties is now active.`,
        "",
        `Sign in: ${process.env.NEXT_PUBLIC_CERTCUE_URL}/login`,
        "",
        "Use the password you created before checkout.",
        "LetDue organises records and reminders. It does not provide legal advice or guarantee compliance.",
      ].join("\n"),
    });
    return;
  }

  const upgradeToken = session.metadata?.upgradeToken;
  if (upgradeToken) {
    const existingUser = await getUserByToken(upgradeToken);
    if (!existingUser) return;
    const user = await activatePilotSubscription({
      userId: existingUser.id,
      stripeCustomerId: customerId,
    });
    if (!user) return;
    const dashboardUrl = `${process.env.NEXT_PUBLIC_CERTCUE_URL}/dashboard/${user.accessToken}`;
    await sendEmail({
      to: user.email,
      subject: "Your LetDue monitoring is active",
      text: `Thank you for becoming a LetDue founding customer. Your three-property monitoring and reminders are now active.\n\nOpen your private dashboard: ${dashboardUrl}\n\nKeep this link private.`,
    });
    return;
  }

  const onboardingText = session.metadata?.onboarding;
  if (!email || !onboardingText) return;

  const onboarding = JSON.parse(onboardingText) as Onboarding;
  const { user } = await activateCustomer({
    email,
    stripeCustomerId: customerId,
    stripeSessionId: session.id,
    address: onboarding.address,
    hasGas: onboarding.hasGas,
    isHmo: onboarding.isHmo,
    dates: onboarding.dates,
  });

  const dashboardUrl = `${process.env.NEXT_PUBLIC_CERTCUE_URL}/dashboard/${user.accessToken}`;
  await sendEmail({
    to: email,
    subject: "Your LetDue property is now monitored",
    text: `Your LetDue monitoring is active for ${onboarding.address}.\n\nOpen your private dashboard: ${dashboardUrl}\n\nKeep this link private.`,
  });
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !webhookSecret) {
    return Response.json(
      { error: "Webhook is not configured." },
      { status: 400 },
    );
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      await request.text(),
      signature,
      webhookSecret,
    );
  } catch {
    return Response.json({ error: "Invalid signature." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    await activateCheckout(event.data.object);
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object;
    const customerId =
      typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer.id;
    await setSubscriptionStatus(customerId, "cancelled");
  }

  if (
    event.type === "customer.subscription.updated" &&
    event.data.object.status === "past_due"
  ) {
    const subscription = event.data.object;
    const customerId =
      typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer.id;
    await setSubscriptionStatus(customerId, "past_due");
  }

  return Response.json({ received: true });
}
