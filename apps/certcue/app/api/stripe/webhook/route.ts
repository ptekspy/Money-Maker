import type Stripe from "stripe";
import { getSql } from "@/lib/database";
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
  const onboardingText = session.metadata?.onboarding;
  if (!email || !customerId || !onboardingText) return;

  const onboarding = JSON.parse(onboardingText) as Onboarding;
  const sql = getSql();
  const users = (await sql`
    insert into certcue_users (email, stripe_customer_id, subscription_status)
    values (${email.toLowerCase()}, ${customerId}, 'active')
    on conflict (email) do update set
      stripe_customer_id = excluded.stripe_customer_id,
      subscription_status = 'active',
      updated_at = now()
    returning id, access_token
  `) as { id: string; access_token: string }[];
  const user = users[0];
  if (!user) return;

  const properties = (await sql`
    insert into certcue_properties (user_id, stripe_session_id, address, has_gas, is_hmo)
    values (${user.id}, ${session.id}, ${onboarding.address}, ${onboarding.hasGas}, ${onboarding.isHmo})
    on conflict (stripe_session_id) do update set address = excluded.address
    returning id
  `) as { id: string }[];
  const property = properties[0];
  if (!property) return;

  for (const [kind, expiry] of Object.entries(onboarding.dates)) {
    if (!expiry) continue;
    await sql`
      insert into certcue_certificates (property_id, kind, expiry_date)
      values (${property.id}, ${kind}, ${expiry})
      on conflict (property_id, kind) do update set expiry_date = excluded.expiry_date
    `;
  }

  const dashboardUrl = `${process.env.NEXT_PUBLIC_CERTCUE_URL}/dashboard/${user.access_token}`;
  await sendEmail({
    to: email,
    subject: "Your CertCue property is now monitored",
    text: `Your CertCue monitoring is active for ${onboarding.address}.\n\nOpen your private dashboard: ${dashboardUrl}\n\nKeep this link private.`,
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
    const sql = getSql();
    await sql`
      update certcue_users set subscription_status = 'cancelled', updated_at = now()
      where stripe_customer_id = ${customerId}
    `;
  }

  return Response.json({ received: true });
}
