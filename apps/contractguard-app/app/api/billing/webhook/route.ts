import { type NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { recordOperationalEvent, updateBilling } from "@/lib/data";
import { requiredEnv } from "@/lib/env";
import { stripe, stripeWebhookConfigured } from "@/lib/stripe";

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
      if (installationId) {
        await updateBilling({
          installationId,
          billingStatus: status(subscription),
          stripeCustomerId: String(subscription.customer),
          stripeSubscriptionId: subscription.id,
        });
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
