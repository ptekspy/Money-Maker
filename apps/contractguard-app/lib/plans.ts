export const PLANS = {
  starter: {
    name: "Starter",
    monthlyPrice: 19,
    repositoryLimit: 3,
  },
  pro: {
    name: "Pro",
    monthlyPrice: 49,
    repositoryLimit: 20,
  },
} as const;

export type BillingPlan = keyof typeof PLANS;

export function billingPlan(value?: string): BillingPlan {
  return value === "pro" ? "pro" : "starter";
}

export function repositoryLimit(value?: string) {
  return PLANS[billingPlan(value)].repositoryLimit;
}
