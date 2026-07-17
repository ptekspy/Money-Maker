export const PLANS = {
  starter: {
    name: "Starter",
    monthlyPrice: 19,
    repositoryLimit: 3,
    includedSeats: 1,
  },
  pro: {
    name: "Pro",
    monthlyPrice: 49,
    repositoryLimit: 20,
    includedSeats: 1,
  },
  teams: {
    name: "Teams",
    monthlyPrice: 149,
    repositoryLimit: 50,
    includedSeats: 5,
    additionalSeatPrice: 15,
  },
} as const;

export type BillingPlan = keyof typeof PLANS;

export function billingPlan(value?: string): BillingPlan {
  if (value === "teams") return "teams";
  return value === "pro" ? "pro" : "starter";
}

export function repositoryLimit(value?: string) {
  return PLANS[billingPlan(value)].repositoryLimit;
}
