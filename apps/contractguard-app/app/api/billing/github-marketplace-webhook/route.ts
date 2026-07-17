import { type NextRequest, NextResponse } from "next/server";
import {
  type BillingStatus,
  claimWebhook,
  recordOperationalEvent,
  saveMarketplacePurchase,
} from "@/lib/data";
import { verifyMarketplaceWebhookSignature } from "@/lib/github";
import type { BillingPlan } from "@/lib/plans";

export const runtime = "nodejs";

type JsonObject = Record<string, unknown>;

function object(value: unknown): JsonObject {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonObject)
    : {};
}

function string(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

function number(value: unknown) {
  return typeof value === "number" && Number.isSafeInteger(value)
    ? value
    : undefined;
}

function planFromMarketplace(value: unknown): BillingPlan | undefined {
  const plan = string(value)?.trim().toLowerCase();
  if (plan === "starter" || plan === "pro" || plan === "teams") return plan;
}

export async function POST(request: NextRequest) {
  const deliveryId = request.headers.get("x-github-delivery");
  const event = request.headers.get("x-github-event");
  let accountId: number | undefined;

  try {
    const body = await request.text();
    if (
      !verifyMarketplaceWebhookSignature(
        body,
        request.headers.get("x-hub-signature-256"),
      )
    ) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
    if (!deliveryId || !event) {
      return NextResponse.json({ error: "Missing headers" }, { status: 400 });
    }
    if (!(await claimWebhook(`marketplace-${deliveryId}`))) {
      return NextResponse.json({ duplicate: true });
    }
    if (event === "ping") {
      return NextResponse.json({ accepted: true }, { status: 202 });
    }
    if (event !== "marketplace_purchase") {
      return NextResponse.json({ ignored: true }, { status: 202 });
    }

    const payload = object(JSON.parse(body));
    const action = string(payload.action);
    if (!action || !["purchased", "changed", "cancelled"].includes(action)) {
      return NextResponse.json(
        { error: "Unsupported Marketplace action" },
        { status: 422 },
      );
    }

    const purchase = object(payload.marketplace_purchase);
    const account = object(purchase.account);
    const plan = object(purchase.plan);
    accountId = number(account.id);
    const accountLogin = string(account.login);
    const billingPlan = planFromMarketplace(plan.name);
    const marketplacePlanId = number(plan.id);
    const effectiveAt = string(payload.effective_date);
    if (
      !accountId ||
      !accountLogin ||
      !billingPlan ||
      !marketplacePlanId ||
      !effectiveAt
    ) {
      return NextResponse.json(
        { error: "Marketplace payload is missing required fields" },
        { status: 422 },
      );
    }

    const onFreeTrial = purchase.on_free_trial === true;
    const billingStatus: BillingStatus =
      action === "cancelled"
        ? "cancelled"
        : onFreeTrial
          ? "trialing"
          : "active";
    const trialEndsAt = onFreeTrial
      ? string(purchase.free_trial_ends_on)
      : undefined;
    if (billingStatus === "trialing" && !trialEndsAt) {
      return NextResponse.json(
        { error: "Free-trial payload is missing its end date" },
        { status: 422 },
      );
    }

    const installationCount = await saveMarketplacePurchase({
      accountId,
      accountLogin,
      billingStatus,
      billingPlan,
      githubMarketplacePlanId: marketplacePlanId,
      effectiveAt,
      trialEndsAt,
    });
    return NextResponse.json(
      { accepted: true, installationsUpdated: installationCount },
      { status: 202 },
    );
  } catch (error) {
    console.error("GitHub Marketplace webhook failed", {
      deliveryId,
      event,
      accountId,
      message: error instanceof Error ? error.message : String(error),
    });
    await recordOperationalEvent({
      severity: "error",
      source: "billing",
      message: "GitHub Marketplace webhook processing failed",
      detail: error instanceof Error ? error.message : String(error),
    }).catch(() => undefined);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}
