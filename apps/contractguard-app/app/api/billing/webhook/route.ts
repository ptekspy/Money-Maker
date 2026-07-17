import { type NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import {
  recordFunnelEvent,
  recordOperationalEvent,
  recordWorkspaceAudit,
  updateBilling,
  updateWorkspaceBilling,
} from "@/lib/data";
import { requiredEnv } from "@/lib/env";
import { billingPlan } from "@/lib/plans";
import { stripe, stripeWebhookConfigured } from "@/lib/stripe";
import { syncWorkspaceSeatBilling } from "@/lib/teams";

export const runtime = "nodejs";

function status(subscription: Stripe.Subscription) {
  if (subscription.status === "active" || subscription.status === "trialing")
    return "active" as const;
  if (subscription.status === "past_due" || subscription.status === "unpaid")
    return "past_due" as const;
  return "cancelled" as const;
}

export async function POST(request: NextRequest) {
  try {
    if (!stripeWebhookConfigured()) {
      return NextResponse.json(
        { error: "Stripe webhook is not configured" },
        { status: 503 },
      );
    }

    const body = await request.text();
    const signature = request.headers.get("stripe-signature");
    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }
    const event = stripe().webhooks.constructEvent(
      body,
      signature,
      requiredEnv("STRIPE_WEBHOOK_SECRET"),
    );
    if (
      [
        "customer.subscription.created",
        "customer.subscription.updated",
        "customer.subscription.deleted",
      ].includes(event.type)
    ) {
      const subscription = event.data.object as Stripe.Subscription;
      const installationId = Number(subscription.metadata.installationId);
      const plan = billingPlan(subscription.metadata.plan);
      const workspaceId = subscription.metadata.workspaceId;
      if (plan === "teams" && workspaceId) {
        const seatPriceId = requiredEnv(
          "STRIPE_CONTRACTGUARD_TEAMS_SEAT_PRICE_ID",
        );
        const seatItem = subscription.items.data.find(
          (item) => item.price.id === seatPriceId,
        );
        const updated = await updateWorkspaceBilling({
          workspaceId,
          billingStatus: status(subscription),
          stripeCustomerId: String(subscription.customer),
          stripeSubscriptionId: subscription.id,
          stripeSeatSubscriptionItemId: seatItem?.id,
          trialEndsAt: subscription.trial_end
            ? new Date(subscription.trial_end * 1000).toISOString()
            : undefined,
        });
        if (!updated) {
          await recordOperationalEvent({
            severity: "warning",
            source: "billing",
            message: "Ignored Stripe Teams event for an unknown workspace",
            detail: `${event.type} - ${event.id}`,
            installationId: installationId || undefined,
          });
          return NextResponse.json({ received: true });
        }
        await recordWorkspaceAudit({
          workspaceId,
          action: `billing.${subscription.status}`,
          detail: event.type,
        });
        if (status(subscription) === "active") {
          await syncWorkspaceSeatBilling(workspaceId);
        }
        if (subscription.status === "active") {
          await recordFunnelEvent({
            type: "subscription_activated",
            installationId: installationId || undefined,
            dedupeId: `stripe-${event.id}`,
          });
        }
      } else if (installationId) {
        const updated = await updateBilling({
          installationId,
          billingStatus: status(subscription),
          billingPlan: plan,
          stripeCustomerId: String(subscription.customer),
          stripeSubscriptionId: subscription.id,
          planTrialEndsAt: subscription.trial_end
            ? new Date(subscription.trial_end * 1000).toISOString()
            : undefined,
          proTrialStarted: plan === "pro" && subscription.status === "trialing",
        });
        if (!updated) {
          await recordOperationalEvent({
            severity: "warning",
            source: "billing",
            message: "Ignored Stripe event for an unknown installation",
            detail: `${event.type} - ${event.id}`,
            installationId,
          });
          return NextResponse.json({ received: true });
        }
        if (subscription.status === "active") {
          await recordFunnelEvent({
            type: "subscription_activated",
            installationId,
            dedupeId: `stripe-${event.id}`,
          });
        }
      } else {
        await recordOperationalEvent({
          severity: "warning",
          source: "billing",
          message: "Ignored Stripe subscription without installation metadata",
          detail: `${event.type} - ${event.id}`,
        });
        return NextResponse.json({ received: true });
      }
      await recordOperationalEvent({
        severity: "info",
        source: "billing",
        message: `Stripe subscription ${subscription.status}`,
        detail: event.type,
        installationId: installationId || undefined,
      });
    }
    return NextResponse.json({ received: true });
  } catch (error) {
    await recordOperationalEvent({
      severity: "error",
      source: "billing",
      message: "Stripe webhook processing failed",
      detail: error instanceof Error ? error.message : String(error),
    }).catch((eventError) => {
      console.error("Could not record Stripe webhook event", { eventError });
    });
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Stripe webhook processing failed",
      },
      { status: 400 },
    );
  }
}
