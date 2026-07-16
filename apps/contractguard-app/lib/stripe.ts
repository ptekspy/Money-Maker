import Stripe from "stripe";
import { env, requiredEnv } from "@/lib/env";

let client: Stripe | undefined;

export function stripeConfig() {
  return {
    secretKey: Boolean(env("STRIPE_SECRET_KEY")),
    webhookSecret: Boolean(env("STRIPE_WEBHOOK_SECRET")),
    priceId: Boolean(env("STRIPE_CONTRACTGUARD_PRICE_ID")),
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
