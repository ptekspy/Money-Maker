import Stripe from "stripe";
import { env, requiredEnv } from "@/lib/env";

let client: Stripe | undefined;

export function stripeConfigured() {
  return Boolean(
    env("STRIPE_SECRET_KEY") && env("STRIPE_CONTRACTGUARD_PRICE_ID"),
  );
}

export function stripe() {
  client ??= new Stripe(requiredEnv("STRIPE_SECRET_KEY"));
  return client;
}
