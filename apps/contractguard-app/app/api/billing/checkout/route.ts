import { type NextRequest, NextResponse } from "next/server";
import { currentSession } from "@/lib/auth";
import {
  createWorkspace,
  getInstallation,
  getUserProfile,
  getWorkspace,
  getWorkspaceMember,
  linkInstallationToWorkspace,
  recordFunnelEvent,
} from "@/lib/data";
import { appUrl, requiredEnv } from "@/lib/env";
import { userInstallations } from "@/lib/github";
import { type BillingPlan, billingPlan } from "@/lib/plans";
import { stripe, stripeConfigured } from "@/lib/stripe";
import { canManageBilling } from "@/lib/teams";

function priceId(plan: BillingPlan) {
  return requiredEnv(
    plan === "teams"
      ? "STRIPE_CONTRACTGUARD_TEAMS_PRICE_ID"
      : plan === "pro"
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
  const foundingOffer =
    plan === "starter" && String(form.get("offer") ?? "") === "founding";
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

  if (plan === "teams") {
    const user = await getUserProfile(session.userId);
    const existingWorkspace = installation.workspaceId
      ? await getWorkspace(installation.workspaceId)
      : null;
    if (existingWorkspace) {
      const membership = await getWorkspaceMember(
        existingWorkspace.workspaceId,
        session.userId,
      );
      if (!membership || !canManageBilling(membership.role))
        return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }
    const workspace =
      existingWorkspace ??
      (await createWorkspace({
        name:
          String(form.get("workspaceName") ?? "").trim() ||
          `${installation.accountLogin} team`,
        ownerUserId: session.userId,
        ownerLogin: session.login,
        ownerEmail: session.email || user?.email,
      }));
    if (!existingWorkspace) {
      await linkInstallationToWorkspace({
        workspaceId: workspace.workspaceId,
        installationId,
        actorUserId: session.userId,
      });
    }
    const origin = appUrl(request.nextUrl.origin);
    if (
      installation.stripeSubscriptionId &&
      installation.billingStatus === "active"
    ) {
      const subscription = await stripe().subscriptions.retrieve(
        installation.stripeSubscriptionId,
      );
      const baseItem = subscription.items.data[0];
      if (!baseItem)
        return NextResponse.json(
          { error: "Subscription has no billable item" },
          { status: 409 },
        );
      await stripe().subscriptions.update(subscription.id, {
        items: [{ id: baseItem.id, price: priceId("teams"), quantity: 1 }],
        metadata: {
          installationId: String(installationId),
          workspaceId: workspace.workspaceId,
          plan: "teams",
        },
        proration_behavior: "create_prorations",
      });
      return NextResponse.redirect(
        `${origin}/teams/${workspace.workspaceId}?billing=converted`,
        303,
      );
    }

    const checkout = await stripe().checkout.sessions.create({
      mode: "subscription",
      ...(installation.stripeCustomerId
        ? { customer: installation.stripeCustomerId }
        : {}),
      client_reference_id: workspace.workspaceId,
      billing_address_collection: "auto",
      payment_method_collection: "always",
      line_items: [{ price: priceId("teams"), quantity: 1 }],
      allow_promotion_codes: true,
      success_url: `${origin}/teams/${workspace.workspaceId}?billing=success`,
      cancel_url: `${origin}/teams/${workspace.workspaceId}?billing=cancelled`,
      subscription_data: {
        trial_period_days: 14,
        metadata: {
          installationId: String(installationId),
          workspaceId: workspace.workspaceId,
          plan: "teams",
        },
      },
      metadata: {
        installationId: String(installationId),
        workspaceId: workspace.workspaceId,
        plan: "teams",
        githubLogin: session.login,
        accountLogin: installation.accountLogin,
      },
    });
    await recordFunnelEvent({
      type: "checkout_started",
      userId: session.userId,
      login: session.login,
      installationId,
      dedupeId: `checkout-${checkout.id}`,
    });
    return NextResponse.redirect(
      checkout.url ?? `${origin}/teams/${workspace.workspaceId}`,
      303,
    );
  }

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
  const foundingCoupon = foundingOffer
    ? await stripe().coupons.create({
        amount_off: 1800,
        currency: "gbp",
        duration: "once",
        name: "Founding first month GBP 1",
        metadata: {
          installationId: String(installationId),
          offer: "founding",
        },
      })
    : null;
  const checkout = await stripe().checkout.sessions.create({
    mode: "subscription",
    ...(installation.stripeCustomerId
      ? { customer: installation.stripeCustomerId }
      : {}),
    client_reference_id: String(installationId),
    billing_address_collection: "auto",
    payment_method_collection: "always",
    line_items: [{ price: priceId(plan), quantity: 1 }],
    ...(foundingCoupon
      ? { discounts: [{ coupon: foundingCoupon.id }] }
      : { allow_promotion_codes: true }),
    success_url: `${origin}/dashboard?billing=success&plan=${plan}${foundingOffer ? "&offer=founding" : ""}`,
    cancel_url: `${origin}/dashboard?billing=cancelled`,
    subscription_data: {
      ...(proTrialEligible ? { trial_period_days: 14 } : {}),
      metadata: {
        installationId: String(installationId),
        plan,
        offer: foundingOffer ? "founding" : "standard",
      },
    },
    metadata: {
      installationId: String(installationId),
      plan,
      githubLogin: session.login,
      accountLogin: installation.accountLogin,
      proTrialEligible: String(proTrialEligible),
      offer: foundingOffer ? "founding" : "standard",
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
