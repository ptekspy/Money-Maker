export const PUBLIC_PROPERTY_LIMITS = [3, 10, 50, 100] as const;

export type PublicPropertyLimit = (typeof PUBLIC_PROPERTY_LIMITS)[number];

export const portfolioPlans = [
  {
    propertyLimit: 3,
    name: "Starter",
    pricePence: 2_800,
    savingPence: 0,
    popular: false,
    description: "For a small portfolio that needs one reliable deadline desk.",
  },
  {
    propertyLimit: 10,
    name: "Growing",
    pricePence: 6_125,
    savingPence: 175,
    popular: false,
    description: "Room to grow without paying for a full property platform.",
  },
  {
    propertyLimit: 50,
    name: "Portfolio",
    pricePence: 23_950,
    savingPence: 2_350,
    description:
      "The best balance of capacity and price for working landlords.",
    popular: true,
  },
  {
    propertyLimit: 100,
    name: "Professional",
    pricePence: 44_025,
    savingPence: 7_275,
    popular: false,
    description: "Serious capacity with the strongest published unit price.",
  },
] as const;

export function isPublicPropertyLimit(
  value: number,
): value is PublicPropertyLimit {
  return PUBLIC_PROPERTY_LIMITS.some((limit) => limit === value);
}

/**
 * Prices flexible properties from the most recently reached published pack.
 * Reaching the next pack swaps in its full bulk discount.
 */
export function annualPricePenceForLimit(propertyLimit: number) {
  const limit = Math.max(3, Math.min(249, Math.floor(propertyLimit)));
  const anchor =
    [...portfolioPlans].reverse().find((plan) => plan.propertyLimit <= limit) ??
    portfolioPlans[0];
  return anchor.pricePence + (limit - anchor.propertyLimit) * 500;
}

export function propertyLimitForAnnualPrice(pricePence: number) {
  for (let limit = 3; limit <= 249; limit += 1) {
    if (annualPricePenceForLimit(limit) === pricePence) return limit;
  }
  return null;
}

export function moneyFromPence(pricePence: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: pricePence % 100 === 0 ? 0 : 2,
  }).format(pricePence / 100);
}
