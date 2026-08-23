import assert from "node:assert/strict";
import Stripe from "stripe";
import { annualPricePenceForLimit } from "../lib/pricing.ts";

const secretKey = process.env.STRIPE_SECRET_KEY;
if (!secretKey?.startsWith("sk_test_")) {
  throw new Error("Refusing to run without a Stripe test-mode secret key.");
}

const stripe = new Stripe(secretKey, { typescript: true });
const command = process.argv[2];

async function prepare() {
  const runId = `letdue-e2e-${Date.now()}`;
  const product = await stripe.products.create({
    name: "LetDue E2E Test",
    description:
      "Disposable Stripe sandbox product for payment-flow verification",
    metadata: { test_run: runId, environment: "sandbox" },
  });
  assert.equal(product.livemode, false);

  const basePrice = await stripe.prices.create({
    currency: "gbp",
    unit_amount: annualPricePenceForLimit(3),
    recurring: { interval: "year" },
    product: product.id,
    metadata: { test_run: runId, property_limit: "3" },
  });

  const sessions: Record<string, { id: string; url: string }> = {};
  for (const propertyLimit of [3, 10, 50, 100]) {
    const expectedAmount = annualPricePenceForLimit(propertyLimit);
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: `payments+${runId}-${propertyLimit}@letdue.com`,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "gbp",
            product: product.id,
            unit_amount: expectedAmount,
            recurring: { interval: "year" },
          },
        },
      ],
      success_url:
        "https://letdue.com/welcome?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "https://letdue.com/?checkout=cancelled#audit",
      metadata: { test_run: runId, propertyLimit: String(propertyLimit) },
      subscription_data: {
        metadata: {
          test_run: runId,
          product: "letdue",
          propertyLimit: String(propertyLimit),
        },
      },
    });
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
    assert.equal(lineItems.data[0]?.amount_total, expectedAmount);
    assert.equal(session.livemode, false);
    assert.ok(session.url);
    sessions[String(propertyLimit)] = { id: session.id, url: session.url };
  }

  return { runId, productId: product.id, basePriceId: basePrice.id, sessions };
}

async function verifyCheckout(sessionId: string) {
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["subscription", "customer"],
  });
  assert.equal(session.livemode, false);
  return {
    id: session.id,
    status: session.status,
    paymentStatus: session.payment_status,
    propertyLimit: session.metadata?.propertyLimit,
    subscriptionId:
      typeof session.subscription === "string"
        ? session.subscription
        : session.subscription?.id,
    customerId:
      typeof session.customer === "string"
        ? session.customer
        : session.customer?.id,
  };
}

async function checkoutUrl(sessionId: string) {
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  assert.equal(session.livemode, false);
  assert.ok(session.url);
  return session.url;
}

async function upgrade(sessionId: string, targetLimit: number) {
  const checkout = await stripe.checkout.sessions.retrieve(sessionId);
  assert.equal(checkout.status, "complete");
  assert.equal(checkout.livemode, false);
  assert.ok(checkout.subscription);
  const subscriptionId =
    typeof checkout.subscription === "string"
      ? checkout.subscription
      : checkout.subscription.id;
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const item = subscription.items.data[0];
  assert.ok(item);
  const product =
    typeof item.price.product === "string"
      ? item.price.product
      : item.price.product.id;
  const prorationDate = Math.floor(Date.now() / 1000);
  const targetAmount = annualPricePenceForLimit(targetLimit);
  const preview = await stripe.invoices.createPreview({
    customer:
      typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer.id,
    subscription: subscription.id,
    subscription_details: {
      items: [
        {
          id: item.id,
          price_data: {
            currency: "gbp",
            product,
            unit_amount: targetAmount,
            recurring: { interval: "year" },
          },
        },
      ],
      proration_behavior: "always_invoice",
      proration_date: prorationDate,
    },
  });
  const idempotencyKey = `letdue-e2e-upgrade-${subscription.id}-${targetLimit}-${prorationDate}`;
  const updateParams: Stripe.SubscriptionUpdateParams = {
    items: [
      {
        id: item.id,
        price_data: {
          currency: "gbp",
          product,
          unit_amount: targetAmount,
          recurring: { interval: "year" },
        },
      },
    ],
    payment_behavior: "pending_if_incomplete",
    proration_behavior: "always_invoice",
    proration_date: prorationDate,
    expand: ["latest_invoice"],
  };
  const first = await stripe.subscriptions.update(
    subscription.id,
    updateParams,
    { idempotencyKey },
  );
  const replay = await stripe.subscriptions.update(
    subscription.id,
    updateParams,
    { idempotencyKey },
  );
  assert.equal(first.id, replay.id);
  assert.equal(first.items.data[0]?.price.unit_amount, targetAmount);
  return {
    subscriptionId: first.id,
    previewAmountDue: preview.amount_due,
    newAnnualAmount: first.items.data[0]?.price.unit_amount,
    status: first.status,
    pendingUpdate: Boolean(first.pending_update),
    idempotentReplay: first.id === replay.id,
  };
}

async function exerciseBilling(productId: string) {
  const customer = await stripe.customers.create({
    email: `payments+${Date.now()}@letdue.com`,
    payment_method: "pm_card_visa",
    invoice_settings: { default_payment_method: "pm_card_visa" },
    metadata: { purpose: "letdue-e2e" },
  });
  const subscription = await stripe.subscriptions.create({
    customer: customer.id,
    items: [
      {
        price_data: {
          currency: "gbp",
          product: productId,
          unit_amount: annualPricePenceForLimit(3),
          recurring: { interval: "year" },
        },
      },
    ],
    payment_behavior: "error_if_incomplete",
    metadata: { product: "letdue", propertyLimit: "3", purpose: "letdue-e2e" },
  });
  assert.equal(subscription.livemode, false);
  assert.equal(subscription.status, "active");
  assert.equal(subscription.items.data[0]?.price.unit_amount, 2_800);

  const item = subscription.items.data[0];
  assert.ok(item);
  const prorationDate = Math.floor(Date.now() / 1000);
  const targetAmount = annualPricePenceForLimit(50);
  const preview = await stripe.invoices.createPreview({
    customer: customer.id,
    subscription: subscription.id,
    subscription_details: {
      items: [
        {
          id: item.id,
          price_data: {
            currency: "gbp",
            product: productId,
            unit_amount: targetAmount,
            recurring: { interval: "year" },
          },
        },
      ],
      proration_behavior: "always_invoice",
      proration_date: prorationDate,
    },
  });
  const idempotencyKey = `letdue-e2e-${subscription.id}-50-${prorationDate}`;
  const updateParams: Stripe.SubscriptionUpdateParams = {
    items: [
      {
        id: item.id,
        price_data: {
          currency: "gbp",
          product: productId,
          unit_amount: targetAmount,
          recurring: { interval: "year" },
        },
      },
    ],
    payment_behavior: "pending_if_incomplete",
    proration_behavior: "always_invoice",
    proration_date: prorationDate,
  };
  const upgraded = await stripe.subscriptions.update(
    subscription.id,
    updateParams,
    { idempotencyKey },
  );
  const replay = await stripe.subscriptions.update(
    subscription.id,
    updateParams,
    { idempotencyKey },
  );
  assert.equal(upgraded.id, replay.id);
  assert.equal(upgraded.items.data[0]?.price.unit_amount, targetAmount);
  assert.equal(upgraded.pending_update, null);

  let declineCode: string | null = null;
  try {
    await stripe.paymentIntents.create({
      amount: 500,
      currency: "gbp",
      payment_method: "pm_card_visa_chargeDeclined",
      payment_method_types: ["card"],
      confirm: true,
    });
  } catch (error) {
    if (error instanceof Stripe.errors.StripeCardError)
      declineCode = error.code ?? null;
  }
  assert.equal(declineCode, "card_declined");

  const threeDs = await stripe.paymentIntents.create({
    amount: 500,
    currency: "gbp",
    payment_method: "pm_card_threeDSecure2Required",
    payment_method_types: ["card"],
    confirm: true,
    return_url: "https://letdue.com/stripe-test-return",
  });
  assert.equal(threeDs.status, "requires_action");
  assert.equal(threeDs.next_action?.type, "redirect_to_url");

  await stripe.subscriptions.cancel(subscription.id);
  await stripe.customers.del(customer.id);
  return {
    initialSubscription: { status: subscription.status, annualAmount: 2_800 },
    upgrade: {
      previewAmountDue: preview.amount_due,
      newAnnualAmount: upgraded.items.data[0]?.price.unit_amount,
      pendingUpdate: Boolean(upgraded.pending_update),
      idempotentReplay: upgraded.id === replay.id,
    },
    declinedPayment: { code: declineCode, accessShouldRemainLocked: true },
    threeDSecure: {
      status: threeDs.status,
      nextAction: threeDs.next_action?.type,
    },
    cleanup: { subscriptionCancelled: true, customerDeleted: true },
  };
}

async function probeWebhook(url: string, webhookSecret: string) {
  const payload = JSON.stringify({
    id: `evt_letdue_e2e_${Date.now()}`,
    object: "event",
    api_version: null,
    created: Math.floor(Date.now() / 1000),
    data: { object: {} },
    livemode: false,
    pending_webhooks: 1,
    request: { id: null, idempotency_key: null },
    type: "test_helpers.test_clock.ready",
  });
  const invalid = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "stripe-signature": "invalid",
    },
    body: payload,
  });
  const validHeader = stripe.webhooks.generateTestHeaderString({
    payload,
    secret: webhookSecret,
  });
  const valid = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "stripe-signature": validHeader,
    },
    body: payload,
  });
  assert.equal(invalid.status, 400);
  assert.equal(valid.status, 200);
  return {
    invalidSignatureStatus: invalid.status,
    validSignatureStatus: valid.status,
  };
}

async function replayCheckout(
  sessionId: string,
  url: string,
  webhookSecret: string,
) {
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["subscription", "customer"],
  });
  assert.equal(session.livemode, false);
  assert.equal(session.status, "complete");
  assert.equal(session.payment_status, "paid");

  const payload = JSON.stringify({
    id: `evt_letdue_e2e_checkout_${Date.now()}`,
    object: "event",
    api_version: null,
    created: Math.floor(Date.now() / 1000),
    data: { object: session },
    livemode: false,
    pending_webhooks: 1,
    request: { id: null, idempotency_key: null },
    type: "checkout.session.completed",
  });
  const signature = stripe.webhooks.generateTestHeaderString({
    payload,
    secret: webhookSecret,
  });
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "stripe-signature": signature,
    },
    body: payload,
  });
  const body = await response.text();
  assert.equal(response.status, 200, body);
  return {
    eventType: "checkout.session.completed",
    sessionId: session.id,
    status: response.status,
    response: body,
  };
}

async function cleanup(productId: string, sessionIds: string[]) {
  const customerIds = new Set<string>();
  for (const sessionId of sessionIds) {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.customer) {
      customerIds.add(
        typeof session.customer === "string"
          ? session.customer
          : session.customer.id,
      );
    }
    if (session.status === "open")
      await stripe.checkout.sessions.expire(session.id);
    if (session.subscription) {
      const subscriptionId =
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription.id;
      await stripe.subscriptions.cancel(subscriptionId);
    }
  }
  for (const customerId of customerIds) await stripe.customers.del(customerId);
  await stripe.products.update(productId, { active: false });
  return {
    archivedProduct: productId,
    cleanedSessions: sessionIds.length,
    deletedCustomers: customerIds.size,
  };
}

let result: unknown;
if (command === "prepare") result = await prepare();
else if (command === "verify-checkout")
  result = await verifyCheckout(process.argv[3]);
else if (command === "checkout-url")
  result = await checkoutUrl(process.argv[3]);
else if (command === "upgrade")
  result = await upgrade(process.argv[3], Number(process.argv[4]));
else if (command === "exercise-billing")
  result = await exerciseBilling(process.argv[3]);
else if (command === "probe-webhook")
  result = await probeWebhook(process.argv[3], process.argv[4]);
else if (command === "replay-checkout")
  result = await replayCheckout(
    process.argv[3],
    process.argv[4],
    process.argv[5],
  );
else if (command === "cleanup")
  result = await cleanup(process.argv[3], process.argv.slice(4));
else
  throw new Error(
    "Use prepare, checkout-url, verify-checkout, upgrade, exercise-billing, probe-webhook, replay-checkout, or cleanup.",
  );

process.stdout.write(`${JSON.stringify(result)}\n`);
