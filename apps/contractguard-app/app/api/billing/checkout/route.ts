import { type NextRequest, NextResponse } from "next/server";
import { currentSession } from "@/lib/auth";
import { getInstallation, recordFunnelEvent } from "@/lib/data";
import { appUrl, requiredEnv } from "@/lib/env";
import { userInstallations } from "@/lib/github";
import { type BillingPlan, billingPlan } from "@/lib/plans";
import { stripe, stripeConfigured } from "@/lib/stripe";

function priceId(plan: BillingPlan) {
  return requiredEnv(
    plan === "pro"
      ? "STRIPE_CONTRACTGUARD_PRO_PRICE_ID"
      : "STRIPE_CONTRACTGUARD_STARTER_PRICE_ID",
  );
}

export async function POST(request: NextRequest) {
  const session = await currentSession();
  if (!session)
    return NextResponse.redirect(
      new URL("/api/auth/github/start", request.url),
      303,
    );
  if (!stripeConfigured())
    return NextResponse.redirect(
      new URL("/dashboard?billing=not-ready", request.url),
      303,
    );

  const form = await request.formData();
  const installationId = Number(form.get("installationId"));
  const plan = billingPlan(String(form.get("plan") ?? "starter"));
  const allowed = (
    await userInstallations(session.accessToken)
  ).installations.some((installation) => installation.id === installationId);
  if (!allowed)
    return NextResponse.json(
      { error: "Installation not available" },
      { status: 403 },
    );
  const installation = await getInstallation(installationId);
  if (!installation)
    return NextResponse.json(
      { error: "Installation not found" },
      { status: 404 },
    );
  if (
    installation.stripeSubscriptionId &&
    ["active", "past_due"].includes(installation.billingStatus)
  ) {
    return NextResponse.redirect(
      new URL("/dashboard?billing=manage-existing", request.url),
      303,
    );
  }

  const proTrialEligible = plan === "pro" && !installation.proTrialStartedAt;
  const origin = appUrl(request.nextUrl.origin);
  const checkout = await stripe().checkout.sessions.create({
    mode: "subscription",
    ...(installation.stripeCustomerId
      ? { customer: installation.stripeCustomerId }
      : {}),
    client_reference_id: String(installationId),
    billing_address_collection: "auto",
    payment_method_collection: "always",
    line_items: [{ price: priceId(plan), quantity: 1 }],
    allow_promotion_codes: true,
    success_url: `${origin}/dashboard?billing=success&plan=${plan}`,
    cancel_url: `${origin}/dashboard?billing=cancelled`,
    subscription_data: {
      ...(proTrialEligible ? { trial_period_days: 14 } : {}),
      metadata: {
        installationId: String(installationId),
        plan,
      },
    },
    metadata: {
      installationId: String(installationId),
      plan,
      githubLogin: session.login,
      accountLogin: installation.accountLogin,
      proTrialEligible: String(proTrialEligible),
    },
  });
  await recordFunnelEvent({
    type: "checkout_started",
    userId: session.userId,
    login: session.login,
    installationId,
    dedupeId: `checkout-${checkout.id}`,
  });
  return NextResponse.redirect(checkout.url ?? `${origin}/dashboard`, 303);
}
