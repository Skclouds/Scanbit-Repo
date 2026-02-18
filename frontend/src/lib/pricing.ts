/**
 * Centralized pricing logic — single source of truth across the app.
 * All plan prices and calculations must use these helpers.
 */

export const YEARLY_DISCOUNT_RATE = 0.1; // 10%
export const MONTHS_PER_YEAR = 12;

export function formatCurrency(amount: number, currency = "INR"): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export interface PlanPricing {
  monthly: number;
  yearlyTotal: number;
  yearlyDiscount: number;
  yearlyPerMonth: number;
}

/**
 * Compute pricing for a plan from its monthly price.
 * Matches backend: yearly = monthly * 12 * (1 - YEARLY_DISCOUNT_RATE).
 */
export function computePlanPricing(monthlyPrice: number): PlanPricing {
  const monthly = Math.round(monthlyPrice);
  const fullYear = monthly * MONTHS_PER_YEAR;
  const yearlyDiscount = Math.round(fullYear * YEARLY_DISCOUNT_RATE);
  const yearlyTotal = Math.round(fullYear * (1 - YEARLY_DISCOUNT_RATE));
  const yearlyPerMonth = yearlyTotal / MONTHS_PER_YEAR;
  return { monthly, yearlyTotal, yearlyDiscount, yearlyPerMonth };
}

export function getEffectiveMonthlyPrice(plan: {
  price?: number;
  customPricing?: { enabled?: boolean; overridePrice?: number; discountPercent?: number };
}): number {
  let p = plan.price ?? 0;
  const cp = plan.customPricing;
  if (cp?.enabled) {
    if (cp.overridePrice != null) p = cp.overridePrice;
    else if ((cp.discountPercent ?? 0) > 0)
      p = (plan.price ?? 0) * (1 - (cp.discountPercent ?? 0) / 100);
  }
  return Math.round(p);
}
