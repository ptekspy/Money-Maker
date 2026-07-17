import Stripe from "stripe";
import { env, requiredEnv } from "@/lib/env";

let client: Stripe | undefined;

export function stripeConfig() {
  const starterPriceId = Boolean(env("STRIPE_CONTRACTGUARD_STARTER_PRICE_ID"));
  const proPriceId = Boolean(env("STRIPE_CONTRACTGUARD_PRO_PRICE_ID"));
  return {
    secretKey: Boolean(env("STRIPE_SECRET_KEY")),
    webhookSecret: Boolean(env("STRIPE_WEBHOOK_SECRET")),
    starterPriceId,
    proPriceId,
    priceId: starterPriceId && proPriceId,
  };
}

export function stripeConfigured() {
  const config = stripeConfig();
  return config.secretKey && config.priceId;
}

export function stripeWebhookConfigured() {
  const config = stripeConfig();
  return config.secretKey && config.webhookSecret;
}

export function stripe() {
  client ??= new Stripe(requiredEnv("STRIPE_SECRET_KEY"));
  return client;
}
